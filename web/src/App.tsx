import { type FormEvent, useState } from "react";
import {
  getGetItemsQueryKey,
  useDeleteItemsId,
  useGetItems,
  usePostItems,
  usePutItemsId,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: getGetItemsQueryKey() });
  const itemsQuery = useGetItems();
  const createItemMutation = usePostItems({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        setDescription("");
        setCategory("");
        await refreshItems();
      },
    },
  });
  const updateItemMutation = usePutItemsId({
    mutation: {
      onSuccess: async () => {
        setEditingResourceId(null);
        setEditTitle("");
        setEditDescription("");
        setEditCategory("");
        await refreshItems();
      },
    },
  });
  const deleteItemMutation = useDeleteItemsId({
    mutation: {
      onSuccess: refreshItems,
    },
  });

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedCategory = category.trim();
  const trimmedEditTitle = editTitle.trim();
  const trimmedEditDescription = editDescription.trim();
  const trimmedEditCategory = editCategory.trim();
  const items = itemsQuery.data?.items ?? [];
  const deletingItemId = deleteItemMutation.variables?.id;
  const updatingResourceId = updateItemMutation.variables?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedTitle || !trimmedDescription || !trimmedCategory || createItemMutation.isPending) {
      return;
    }

    createItemMutation.mutate({
      data: {
        title: trimmedTitle,
        description: trimmedDescription,
        category: trimmedCategory,
      },
    });
  };

  const handleEditStart = (item: {
    id: number;
    title: string;
    description: string;
    category: string;
  }) => {
    setEditingResourceId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCategory(item.category);
  };

  const handleEditCancel = () => {
    setEditingResourceId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCategory("");
  };

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      editingResourceId === null ||
      !trimmedEditTitle ||
      !trimmedEditDescription ||
      !trimmedEditCategory ||
      updateItemMutation.isPending
    ) {
      return;
    }

    updateItemMutation.mutate({
      id: editingResourceId,
      data: {
        title: trimmedEditTitle,
        description: trimmedEditDescription,
        category: trimmedEditCategory,
      },
    });
  };

  const handleRemove = (id: number) => {
    if (deleteItemMutation.isPending) {
      return;
    }

    deleteItemMutation.mutate({ id });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Workshop resources</h1>
          <p className="text-sm text-slate-600">
            Create, update, and remove shared resources with the generated API hooks.
          </p>
        </header>

        <form
          className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Resource name"
            maxLength={120}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
            maxLength={60}
            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            maxLength={500}
            rows={3}
            className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={!trimmedTitle || !trimmedDescription || !trimmedCategory || createItemMutation.isPending}
            className="sm:col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {createItemMutation.isPending ? "Adding..." : "Add resource"}
          </button>
        </form>

        {createItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not add the resource: {createItemMutation.error.message}
          </p>
        ) : null}

        {updateItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not update the resource: {updateItemMutation.error.message}
          </p>
        ) : null}

        {deleteItemMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not remove the resource: {deleteItemMutation.error.message}
          </p>
        ) : null}

        {editingResourceId !== null ? (
          <form
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2"
            onSubmit={handleEditSubmit}
          >
            <div className="sm:col-span-2">
              <h2 className="text-sm font-medium text-slate-700">Edit resource</h2>
            </div>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              placeholder="Resource name"
              maxLength={120}
              className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
            />
            <input
              value={editCategory}
              onChange={(event) => setEditCategory(event.target.value)}
              placeholder="Category"
              maxLength={60}
              className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
            />
            <textarea
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              placeholder="Description"
              maxLength={500}
              rows={3}
              className="sm:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
            />
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={
                  !trimmedEditTitle ||
                  !trimmedEditDescription ||
                  !trimmedEditCategory ||
                  updateItemMutation.isPending
                }
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {updateItemMutation.isPending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={handleEditCancel}
                disabled={updateItemMutation.isPending}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-medium text-slate-700">Resources</h2>

          {itemsQuery.isPending ? <p className="mt-3 text-sm text-slate-600">Loading resources...</p> : null}

          {itemsQuery.isError ? (
            <p className="mt-3 text-sm text-rose-600">Could not load resources: {itemsQuery.error.message}</p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200">
                {items.map((item) => (
                  <li key={item.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium text-slate-900">{item.title}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditStart(item)}
                        disabled={updateItemMutation.isPending || deleteItemMutation.isPending}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {updateItemMutation.isPending && updatingResourceId === item.id
                          ? "Saving..."
                          : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={deleteItemMutation.isPending}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {deleteItemMutation.isPending && deletingItemId === item.id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No resources yet.</p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
