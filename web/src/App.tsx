import { type FormEvent, useState } from "react";
import {
  BookingStatus as BookingStatusOptions,
  getGetBookingsQueryKey,
  getGetItemsQueryKey,
  useGetBookings,
  useDeleteItemsId,
  useGetItems,
  usePostBookings,
  usePostBookingsIdCancel,
  usePostItems,
  usePutItemsId,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";
import type { Booking, BookingStatus, ErrorType } from "./api";

type BookingDraft = {
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
};

const createDefaultBookingDraft = (): BookingDraft => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);

  const end = new Date(start);
  end.setHours(start.getHours() + 1);

  return {
    startsAt: toDateTimeLocalValue(start),
    endsAt: toDateTimeLocalValue(end),
    status: BookingStatusOptions.confirmed,
  };
};

const toDateTimeLocalValue = (value: Date) => {
  const localValue = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localValue.toISOString().slice(0, 16);
};

const toIsoDateTime = (value: string) => new Date(value).toISOString();

const formatBookingDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const getApiErrorMessage = (error: ErrorType<unknown> | null, fallback: string) => {
  const responseData = error?.response?.data as { message?: string } | undefined;
  return responseData?.message ?? error?.message ?? fallback;
};

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [editingResourceId, setEditingResourceId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [bookingDrafts, setBookingDrafts] = useState<Record<number, BookingDraft>>({});
  const queryClient = useQueryClient();
  const refreshItems = () =>
    queryClient.invalidateQueries({ queryKey: [getGetItemsQueryKey()[0]] });
  const refreshBookings = () =>
    queryClient.invalidateQueries({ queryKey: [getGetBookingsQueryKey()[0]] });
  const trimmedSearch = search.trim();
  const itemsQuery = useGetItems(trimmedSearch ? { q: trimmedSearch } : undefined);
  const bookingsQuery = useGetBookings();
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
  const createBookingMutation = usePostBookings({
    mutation: {
      onSuccess: async (_, variables) => {
        setBookingDrafts((current) => ({
          ...current,
          [variables.data.resourceId]: createDefaultBookingDraft(),
        }));
        await refreshBookings();
      },
    },
  });
  const cancelBookingMutation = usePostBookingsIdCancel({
    mutation: {
      onSuccess: refreshBookings,
    },
  });

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const trimmedCategory = category.trim();
  const trimmedEditTitle = editTitle.trim();
  const trimmedEditDescription = editDescription.trim();
  const trimmedEditCategory = editCategory.trim();
  const items = itemsQuery.data?.items ?? [];
  const bookings = bookingsQuery.data?.bookings ?? [];
  const deletingItemId = deleteItemMutation.variables?.id;
  const updatingResourceId = updateItemMutation.variables?.id;
  const bookingGroups = bookings.reduce<Record<number, Booking[]>>((groups, booking) => {
    const existingGroup = groups[booking.resourceId] ?? [];
    existingGroup.push(booking);
    groups[booking.resourceId] = existingGroup;
    return groups;
  }, {});

  const createBookingResourceId = createBookingMutation.variables?.data.resourceId;
  const cancellingBookingId = cancelBookingMutation.variables?.id;

  const getBookingDraft = (resourceId: number) => bookingDrafts[resourceId] ?? createDefaultBookingDraft();

  const updateBookingDraft = (resourceId: number, patch: Partial<BookingDraft>) => {
    setBookingDrafts((current) => ({
      ...current,
      [resourceId]: {
        ...getBookingDraft(resourceId),
        ...patch,
      },
    }));
  };

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

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>, resourceId: number) => {
    event.preventDefault();

    const bookingDraft = getBookingDraft(resourceId);

    if (
      createBookingMutation.isPending ||
      !bookingDraft.startsAt ||
      !bookingDraft.endsAt
    ) {
      return;
    }

    createBookingMutation.mutate({
      data: {
        resourceId,
        status: bookingDraft.status,
        startsAt: toIsoDateTime(bookingDraft.startsAt),
        endsAt: toIsoDateTime(bookingDraft.endsAt),
      },
    });
  };

  const handleBookingCancel = (bookingId: number) => {
    if (cancelBookingMutation.isPending) {
      return;
    }

    cancelBookingMutation.mutate({ id: bookingId });
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

        {bookingsQuery.isError ? (
          <p className="text-sm text-rose-600">
            Could not load bookings: {getApiErrorMessage(bookingsQuery.error, "Unknown error")}
          </p>
        ) : null}

        {createBookingMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not create the booking: {getApiErrorMessage(createBookingMutation.error, "Unknown error")}
          </p>
        ) : null}

        {cancelBookingMutation.isError ? (
          <p className="text-sm text-rose-600">
            Could not cancel the booking: {getApiErrorMessage(cancelBookingMutation.error, "Unknown error")}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-medium text-slate-700">Resources</h2>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search resources"
              maxLength={120}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:max-w-xs"
            />
          </div>

          {itemsQuery.isPending ? <p className="mt-3 text-sm text-slate-600">Loading resources...</p> : null}

          {itemsQuery.isError ? (
            <p className="mt-3 text-sm text-rose-600">Could not load resources: {itemsQuery.error.message}</p>
          ) : null}

          {!itemsQuery.isPending && !itemsQuery.isError ? (
            items.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200">
                {items.map((item) => (
                  <li key={item.id} className="py-3">
                    <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                      </div>

                      <form
                        className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2"
                        onSubmit={(event) => handleBookingSubmit(event, item.id)}
                      >
                        <div className="sm:col-span-2">
                          <h4 className="text-sm font-medium text-slate-800">Book this resource</h4>
                          <p className="text-xs text-slate-500">
                            Confirmed bookings block overlapping confirmed bookings for the same resource.
                          </p>
                        </div>
                        <label className="grid gap-1 text-sm text-slate-700">
                          <span>Start</span>
                          <input
                            type="datetime-local"
                            value={getBookingDraft(item.id).startsAt}
                            onChange={(event) => updateBookingDraft(item.id, { startsAt: event.target.value })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
                          />
                        </label>
                        <label className="grid gap-1 text-sm text-slate-700">
                          <span>End</span>
                          <input
                            type="datetime-local"
                            value={getBookingDraft(item.id).endsAt}
                            onChange={(event) => updateBookingDraft(item.id, { endsAt: event.target.value })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
                          />
                        </label>
                        <label className="grid gap-1 text-sm text-slate-700 sm:col-span-2">
                          <span>Status</span>
                          <select
                            value={getBookingDraft(item.id).status}
                            onChange={(event) => updateBookingDraft(item.id, { status: event.target.value as BookingStatus })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500"
                          >
                            {Object.values(BookingStatusOptions).map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="submit"
                          disabled={createBookingMutation.isPending}
                          className="sm:col-span-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {createBookingMutation.isPending && createBookingResourceId === item.id
                            ? "Creating booking..."
                            : "Create booking"}
                        </button>
                      </form>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-800">Bookings</h4>
                          {bookingsQuery.isPending ? (
                            <span className="text-xs text-slate-500">Loading bookings...</span>
                          ) : null}
                        </div>
                        {(bookingGroups[item.id] ?? []).length > 0 ? (
                          <ul className="space-y-2">
                            {(bookingGroups[item.id] ?? []).map((booking) => (
                              <li
                                key={booking.id}
                                className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-900">
                                      {formatBookingDate(booking.startsAt)} to {formatBookingDate(booking.endsAt)}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
                                      {booking.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500">Booking #{booking.id}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleBookingCancel(booking.id)}
                                  disabled={cancelBookingMutation.isPending || booking.status === BookingStatusOptions.cancelled}
                                  className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                                >
                                  {cancelBookingMutation.isPending && cancellingBookingId === booking.id
                                    ? "Cancelling..."
                                    : booking.status === BookingStatusOptions.cancelled
                                      ? "Cancelled"
                                      : "Cancel booking"}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          !bookingsQuery.isPending ? (
                            <p className="text-sm text-slate-600">No bookings for this resource yet.</p>
                          ) : null
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {trimmedSearch ? "No resources match that search." : "No resources yet."}
              </p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
