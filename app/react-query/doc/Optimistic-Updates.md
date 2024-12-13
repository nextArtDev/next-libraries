# Optimistic Updates


```ts
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo }) {
  const { mutate } = useToggleTodo(todo.id)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}
```

## Optimistic updates

If you already know what the final UI should look like after the mutation, you almost always want to show the user the result of their action immediately, and then roll back the UI if the server responds with an error. This is such a common pattern that it even has a fancy name, Optimistic Updates.
To do that, we need to know when the mutation is pending. If it is, then the checkbox should be in the opposite state of what it was before (since, because Math, that's the only possible state change for a checkbox). If it's not, then it should remain the same.
While the query is pending, the state of the checkbox will be the opposite of what's currently in the cache. From there, if the mutation succeeds, the query will be invalidated and the UI will remain the same (since it was already showing the optimistic update). If the mutation fails, then at that point the mutation is no longer pending and the state of the checkbox will be whatever it was before mutation was attempted, which is also the exact value that's in the cache.

```ts
function Todo({ todo }) {
function useToggleTodo(id) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo }) {
  const { mutate, isPending } = useToggleTodo(todo.id)

  return (
    <li>
      <input
        type="checkbox"
        checked={isPending ? !todo.done : todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

```

This approach is simple, but its simplicity is also its downfall.

Notice __what happens when you click on multiple checkboxes in a row__, before any mutation has time to complete and invalidate the query.
The state of the checkboxes will be consistent with the state of the server – eventually.

Because we're not updating the cache until after the mutation is successful, if you click on multiple checkboxes in a row, there's a moment between when the original mutation has finished, and when the cache has been updated. In this moment, the state of the initial checkbox will be inconsistent with the state of the server.

It will fix itself after the last mutation has succeeded and the queries have been invalidated, but it's not a great experience for the user.
Instead of invalidating the queries when a mutation succeeds and relying on the status of the mutation to determine the state of the UI, __what if we just update the cache optimistically and then roll it back if it fails__?

- First thing we'll do is get rid of our onSuccess callback.

Since it doesn't run until after the mutation has succeeded, it's too late for us to do anything optimistic with it.

- Next, we need a way to execute some code before the mutation is sent to the server. We can do this with the onMutate callback. Now if we put our logic for updating the cache inside of onMutate, React Query will execute it before it sends the mutation to the server.

```ts
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    }
  })
}
```

Note: we've also had to pass sort down to useToggleTodo in order to update the correct entry in the cache and we've updated our Todo component to no longer change its state based on the isPending value.

```ts
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo, sort }) {
  const { mutate, isPending } = useToggleTodo(todo.id, sort)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} sort={sort} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}

```

## What if it fails? 

In that scenario, we need to be able to roll back the cache to whatever it previously was.

To do this, we can use the onError callback which will run if the mutation fails.

If the mutation fails, because we already optimistically updated the cache as if it would succeed, we need to roll back the cache to what it was before the mutation was attempted.
To do that, we need a two things – _a snapshot of the cache as it was before the mutation_ was attempted, and a way to reset to cache to that snapshot.

For the snapshot, we actually want to get that inside of onMutate before we update the cache optimistically.

Now we need a way to __access snapshot inside of onError__ so we can reset the cache to that value if an error occurs. Because this is a common problem, React Query will make whatever you return from onMutate available as the third argument in all the other callbacks.
So in our example, let's return a function from onMutate that, when invoked, will reset the cache to the snapshot.
Now inside of onError, we can access our rollback function and call it to reset the cache.

```ts
function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: () => {
      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: (error, variables, rollback) => {
      rollback?.()
    }
  })
}
```

## Now, whenever an error occurs,

because we've captured the previous state of the cache in a snapshot via a closure, we can invoke our rollback function, resetting the cache to what it was before the mutation was attempted.
At this point, the need to haves are done – we're just left with two other nice to haves that we can add to bulletproof the experience even more.

- First, we want to make sure that there are no other re fetches happening before we manually update the cache. If we don't, and the re fetches resolve after we've made the optimistic cache update, then they'll override the change, leading to an inconsistent UI. __To do this, we can call queryClient.cancelQueries__ before any other logic inside of onMutate.
- Finally, useMutation supports another callback, onSettled, which will run after all its other callbacks, regardless of whether the mutation succeeded or failed.

It's a good idea to __always invalidate the necessary queries inside of onSettled__ just to make sure the cache is definitely in sync with the server. It probably is before this anyway (because of the optimistic update), but if for some reason it's not (like if the server responded with a different value than expected), invalidating the query will trigger a refetch and get the cache back in sync.
__Before the mutation occurs, we cancel any ongoing fetching, capture a snapshot of the cache, update the cache optimistically so the user gets instant feedback, and return a rollback function that will reset the cache to the snapshot if the mutation fails. And just in case, after the mutation has finished, we invalidate the query to make sure the cache is in sync with the server.__

```ts
import * as React from 'react'
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query'
import { fetchTodos, addTodo, toggleTodo } from './api'

function useToggleTodo(id, sort) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleTodo(id),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['todos', 'list', { sort }]
      })

      const snapshot = queryClient.getQueryData(
        ['todos', 'list', { sort }]
      )

      queryClient.setQueryData(
        ['todos', 'list', { sort }],
        (previousTodos) => previousTodos?.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      )

      return () => {
        queryClient.setQueryData(
          ['todos', 'list', { sort }],
          snapshot
        )
      }
    },
    onError: (error, variables, rollback) => {
      console.log('error', error)
      rollback?.()
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function useTodos(sort) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['todos', 'list', { sort }],
    queryFn: () => fetchTodos(sort),
    placeholderData: queryClient.getQueryData(['todos', 'list', { sort }]),
    staleTime: 10 * 1000
  })
}

function useAddTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: ['todos', 'list']
      })
    }
  })
}

function Todo({ todo, sort }) {
  const { mutate, isPending } = useToggleTodo(todo.id, sort)

  return (
    <li>
      <input
        type="checkbox"
        checked={todo.done}
        onChange={mutate}
      />
      {todo.title}
    </li>
  )
}

export function TodoList() {
  const [sort, setSort] = React.useState('id')
  const { status, data, isPlaceholderData } = useTodos(sort)
  const addTodo = useAddTodo()

  if (status === 'pending') {
    return <div>...</div>
  }

  if (status === 'error') {
    return <div>Error fetching todos</div>
  }

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = new FormData(event.currentTarget).get('add')
    addTodo.mutate(title, {
      onSuccess: () => event.target.reset()
    })
  }

  return (
    <div style={{ opacity: isPlaceholderData ? 0.8 : 1 }}>
      <label>
        Sort by:
        <select
          value={sort}
          onChange={(event) => {
            setSort(event.target.value)
        }}>
          <option value="id">id</option>
          <option value="title">title</option>
          <option value="done">completed</option>
        </select>
      </label>
      <ul>
        {data.map(todo => (
          <Todo todo={todo} key={todo.id} sort={sort} />
        ))}
      </ul>
      <form
        onSubmit={handleAddTodo}
        style={{ opacity: addTodo.isPending ? 0.8 : 1 }}
      >
        <label>Add:
          <input
            type="text"
            name="add"
            placeholder="new todo"
          />
        </label>
        <button
          type="submit"
          disabled={addTodo.isPending}
        >
          Submit
        </button>
      </form>
    </div>
  )
}

```