# Performance Optimizations

Any time you call useQuery, you get back a brand new object (reference value). Unless React Query memoizes that value and you wrap your components in React.memo, basically your entire component tree will re-render every time a Query runs – which as we've seen, is a lot.
Obviously if this were the case, React Query would be close to irrelevant. So how do we solve this? Two ways: _Structural Sharing_ and _Observers_.

## structural sharing

Whenever a query runs and the queryFn is invoked, you're almost always going to give React Query back a new object (usually in the form of res.json()).
However, instead of putting that object in the query cache immediately and then returning it as data, __React Query will first check to see if any of the properties and values on the object have actually changed__.
If they have, then React Query will create a new data object and give you that. But if they haven't, instead of creating a new object or reusing the one you gave it, React Query will just reuse the same object as before – keeping the reference the same.
This optimization allows you to use the data object with React.memo or include it in the dependency array for useEffect or useMemo without worrying about unnecessary effects or calculations.
However, this is only half of the equation. As we saw earlier, even with structural sharing, you'd still need to wrap your components in React.memo to prevent them from re-rendering every time a Query ran.

## Observers 

Observers are the glue _between the Query Cache and any React component_, and they live outside the React component tree.
What this means is that __when a queryFn re-runs and the Query cache is updated__, at that moment, __the Observer can decide whether or not to inform the React component about that change__.

What will happen if we add a new property to the object that the queryFn returns, but this property 1. changes every time queryFn is invoked but 2. isn't used by the component?

Though the Observer is smart enough to know that it doesn't need to re-render the component when its data doesn't change, it's not smart enough to know about what data the component actually uses.

Thankfully, with a little help from us, we can make the Observer a little smarter.

## select

If your queryFn returns extra data that isn't needed in the component, you can use the _select_ option to __filter out the data that the component doesn't need__ – and therefore, subscribe to a subset of the data and only re-render the component when necessary.

It works by __accepting the data returned from the queryFn__, and __the value it returns will be passed along to the component__.

Even though the updatedAt property changes every time the queryFn runs, the component no longer re-renders since we've filtered that value out using select.

```ts
const { data, refetch } = useQuery({
  queryKey: ['user'],
  queryFn: () => {
    console.log('queryFn runs')
    return Promise.resolve({
      name: 'Dominik',
      updatedAt: Date.now()
    })
  },
  // select a data returned by queryFn to the component
  select: (data) => ({ name: data.name })
})
```

And if your select transformation happened to be prohibitively expensive, you could always memoize it with useCallback so that it only runs when necessary.

```ts
select: React.useCallback(
  expensiveTransformation, 
  []
)
```

## Tracked Properties

When you invoke useQuery, you're not just getting back data, but an entire object that represents everything about the query itself – _including the status, fetchStatus, error, etc_.

Despite the performance benefits of how React Query handles data, it would be all for nothing if a component still had to re-render whenever any of the properties on the Query object changed.

And to make it worse, as you've seen, __properties like fetchStatus are changing often as React Query is always making background re-fetches to ensure the data is fresh__.

So how do we solve this one? With a really interesting feature we call Tracked Properties.
If a component doesn't use fetchStatus, it doesn't make sense for that component to re-render just because the fetchStatus changes from idle to fetching and back again. It's Tracked Properties that make this possible and ensure that components are always up-to-date, while keeping their render count to the necessary minimum.

## Optimizing fetches

So at this point we've covered different render optimizations that React Query makes under the hood, and some that you can do yourself (like select). However, it's not just rendering that can be optimized, but fetches as well.
One way is instead of constantly fetching and then refetching, React Query will only refetch stale data based on signals from the user. Of course, you can adjust this by configuring staleTime, but that isn't always enough.

### signal 

For example, say you had an app with a non-debounced search input field that fetched some data. Each keystroke would create a new query, firing off multiple requests in short succession. There's nothing you can do to staleTime to fix that.
When React Query invokes a queryFn, it will pass to it a signal as part of the QueryFunctionContext. This signal originates from an AbortController (that React Query will create) and if you pass it to your fetch request, React Query can then cancel the request if the Query becomes unused.

```ts
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: ({ signal }) => {
      const searchParams = new URLSearchParams()
      searchParams.append('q', `${search} is:issue repo:TanStack/query`)

      const url = `https://api.github.com/search/issues?${searchParams}`

      const response = await fetch(url, { signal })

      if (!response.ok) {
        throw new Error('fetch failed')
      }

      return response.json()
    }
  })
}

//
function useIssues(search) {
  return useQuery({
    queryKey: ['issues', search],
    queryFn: ({ signal }) => fetchIssues(search, signal),
    staleTime: 1 * 60 * 1000,
  })
}

export function IssueList({ search }) {
  const { data, status, fetchStatus } = useIssues(search)
  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching data 😔</div>
  }

  if (data.items.length === 0) {
    return <div>No results found</div>
  }

  return (
    <div>
      <ul>
        { data.items.map(issue => <li key={issue.id}>{issue.title}</li>) }
      </ul>
      <div>{ fetchStatus === 'fetching' ? 'updating...' : null }</div>
    </div>
  )
}

```