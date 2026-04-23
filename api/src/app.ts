import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { prisma } from './db.js'

const RootResponseSchema = z.object({
  message: z.string(),
  openapi: z.string()
}).openapi('RootResponse')

const HealthResponseSchema = z.object({
  status: z.literal('ok')
}).openapi('HealthResponse')

const ItemSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  title: z.string().min(1).max(120).openapi({ example: 'Build a workshop API' }),
  description: z.string().min(1).max(500).openapi({ example: 'Internal API used to manage workshop resources.' }),
  category: z.string().min(1).max(60).openapi({ example: 'Software' }),
  createdAt: z.string().datetime().openapi({ example: '2024-01-01T00:00:00.000Z' })
}).openapi('Item')

const ItemListResponseSchema = z.object({
  items: z.array(ItemSchema)
}).openapi('ItemListResponse')

const CreateItemSchema = z.object({
  title: z.string().trim().min(1).max(120).openapi({ example: 'Build a workshop API' }),
  description: z.string().trim().min(1).max(500).openapi({ example: 'Internal API used to manage workshop resources.' }),
  category: z.string().trim().min(1).max(60).openapi({ example: 'Software' })
}).openapi('CreateItem')

const UpdateItemSchema = CreateItemSchema.openapi('UpdateItem')

const ItemQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional().openapi({
    param: {
      name: 'q',
      in: 'query'
    },
    example: 'projector'
  })
}).openapi('ItemQuery')

const ItemParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
}).openapi('ItemParams')

const bookingStatusValues = ['draft', 'confirmed', 'cancelled', 'completed'] as const

type BookingStatus = (typeof bookingStatusValues)[number]

const BookingStatusSchema = z.enum(bookingStatusValues).openapi('BookingStatus')

const BookingSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  resourceId: z.number().int().positive().openapi({ example: 1 }),
  status: BookingStatusSchema,
  startsAt: z.string().datetime().openapi({ example: '2026-04-23T09:00:00.000Z' }),
  endsAt: z.string().datetime().openapi({ example: '2026-04-23T10:00:00.000Z' }),
  createdAt: z.string().datetime().openapi({ example: '2026-04-22T16:45:00.000Z' })
}).openapi('Booking')

const BookingListResponseSchema = z.object({
  bookings: z.array(BookingSchema)
}).openapi('BookingListResponse')

const ErrorResponseSchema = z.object({
  message: z.string()
}).openapi('ErrorResponse')

const CreateBookingSchema = z.object({
  resourceId: z.number().int().positive().openapi({ example: 1 }),
  status: BookingStatusSchema.optional().openapi({ example: 'confirmed' }),
  startsAt: z.string().datetime().openapi({ example: '2026-04-23T09:00:00.000Z' }),
  endsAt: z.string().datetime().openapi({ example: '2026-04-23T10:00:00.000Z' })
}).openapi('CreateBooking')

const BookingParamsSchema = z.object({
  id: z.coerce.number().int().positive().openapi({
    param: {
      name: 'id',
      in: 'path'
    },
    example: 1
  })
}).openapi('BookingParams')

const rootRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['System'],
  responses: {
    200: {
      description: 'Basic API information',
      content: {
        'application/json': {
          schema: RootResponseSchema
        }
      }
    }
  }
})

const healthRoute = createRoute({
  method: 'get',
  path: '/health',
  tags: ['System'],
  responses: {
    200: {
      description: 'Health check',
      content: {
        'application/json': {
          schema: HealthResponseSchema
        }
      }
    }
  }
})

const listItemsRoute = createRoute({
  method: 'get',
  path: '/items',
  tags: ['Items'],
  request: {
    query: ItemQuerySchema
  },
  responses: {
    200: {
      description: 'List persisted items',
      content: {
        'application/json': {
          schema: ItemListResponseSchema
        }
      }
    }
  }
})

const createItemRoute = createRoute({
  method: 'post',
  path: '/items',
  tags: ['Items'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateItemSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a persisted item',
      content: {
        'application/json': {
          schema: ItemSchema
        }
      }
    }
  }
})

const deleteItemRoute = createRoute({
  method: 'delete',
  path: '/items/{id}',
  tags: ['Items'],
  request: {
    params: ItemParamsSchema
  },
  responses: {
    204: {
      description: 'Remove a persisted item'
    }
  }
})

const updateItemRoute = createRoute({
  method: 'put',
  path: '/items/{id}',
  tags: ['Items'],
  request: {
    params: ItemParamsSchema,
    body: {
      required: true,
      content: {
        'application/json': {
          schema: UpdateItemSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update a persisted item',
      content: {
        'application/json': {
          schema: ItemSchema
        }
      }
    },
    404: {
      description: 'Item not found'
    }
  }
})

const listBookingsRoute = createRoute({
  method: 'get',
  path: '/bookings',
  tags: ['Bookings'],
  responses: {
    200: {
      description: 'List persisted bookings',
      content: {
        'application/json': {
          schema: BookingListResponseSchema
        }
      }
    }
  }
})

const createBookingRoute = createRoute({
  method: 'post',
  path: '/bookings',
  tags: ['Bookings'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: CreateBookingSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Create a persisted booking',
      content: {
        'application/json': {
          schema: BookingSchema
        }
      }
    },
    400: {
      description: 'Invalid booking time range',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    404: {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    409: {
      description: 'Booking conflicts with an existing confirmed booking',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
})

const cancelBookingRoute = createRoute({
  method: 'post',
  path: '/bookings/{id}/cancel',
  tags: ['Bookings'],
  request: {
    params: BookingParamsSchema
  },
  responses: {
    200: {
      description: 'Cancel an existing booking',
      content: {
        'application/json': {
          schema: BookingSchema
        }
      }
    },
    404: {
      description: 'Booking not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
})

const toItemResponse = (item: { id: number; title: string; description: string; category: string; createdAt: Date }) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  category: item.category,
  createdAt: item.createdAt.toISOString()
})

const toBookingResponse = (booking: { id: number; resourceId: number; status: string; startsAt: Date; endsAt: Date; createdAt: Date }) => ({
  id: booking.id,
  resourceId: booking.resourceId,
  status: booking.status as BookingStatus,
  startsAt: booking.startsAt.toISOString(),
  endsAt: booking.endsAt.toISOString(),
  createdAt: booking.createdAt.toISOString()
})

const defaultCorsOrigins = ['http://localhost:4173', 'http://localhost:5173']
const configuredCorsOrigins = process.env.CORS_ORIGIN
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const openApiDocumentConfig = {
  openapi: '3.0.0',
  info: {
    title: 'Cyfor Workshop API',
    version: '1.0.0',
    description: 'Workshop starter API built with Hono, Prisma, and SQLite.'
  }
}

export const app = new OpenAPIHono()

app.use('*', cors({
  origin: configuredCorsOrigins?.length ? configuredCorsOrigins : defaultCorsOrigins
}))

app.doc('/openapi.json', openApiDocumentConfig)

app.openapi(rootRoute, (c) => {
  return c.json({
    message: 'Cyfor workshop API',
    openapi: '/openapi.json'
  }, 200)
})

app.openapi(healthRoute, (c) => {
  return c.json({
    status: 'ok'
  }, 200)
})

app.openapi(listItemsRoute, async (c) => {
  const { q } = c.req.valid('query')
  const items = await prisma.item.findMany({
    where: q ? {
      OR: [
        {
          title: {
            contains: q
          }
        },
        {
          description: {
            contains: q
          }
        },
        {
          category: {
            contains: q
          }
        }
      ]
    } : undefined,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return c.json({
    items: items.map(toItemResponse)
  }, 200)
})

app.openapi(createItemRoute, async (c) => {
  const { title, description, category } = c.req.valid('json')
  const item = await prisma.item.create({
    data: {
      title,
      description,
      category
    }
  })

  return c.json(toItemResponse(item), 201)
})

app.openapi(listBookingsRoute, async (c) => {
  const bookings = await prisma.booking.findMany({
    orderBy: [
      {
        startsAt: 'asc'
      },
      {
        createdAt: 'desc'
      }
    ]
  })

  return c.json({
    bookings: bookings.map(toBookingResponse)
  }, 200)
})

app.openapi(createBookingRoute, async (c) => {
  const { resourceId, startsAt: startsAtInput, endsAt: endsAtInput, status = 'confirmed' } = c.req.valid('json')
  const startsAt = new Date(startsAtInput)
  const endsAt = new Date(endsAtInput)

  if (endsAt <= startsAt) {
    return c.json({
      message: 'End time must be after start time.'
    }, 400)
  }

  const resource = await prisma.item.findUnique({
    where: {
      id: resourceId
    }
  })

  if (!resource) {
    return c.json({
      message: 'Resource not found.'
    }, 404)
  }

  if (status === 'confirmed') {
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: 'confirmed',
        startsAt: {
          lt: endsAt
        },
        endsAt: {
          gt: startsAt
        }
      }
    })

    if (conflictingBooking) {
      return c.json({
        message: 'Booking conflicts with an existing confirmed booking.'
      }, 409)
    }
  }

  const booking = await prisma.booking.create({
    data: {
      resourceId,
      status,
      startsAt,
      endsAt
    }
  })

  return c.json(toBookingResponse(booking), 201)
})

app.openapi(updateItemRoute, async (c) => {
  const { id } = c.req.valid('param')
  const { title, description, category } = c.req.valid('json')

  const existingItem = await prisma.item.findUnique({
    where: {
      id
    }
  })

  if (!existingItem) {
    return c.body(null, 404)
  }

  const item = await prisma.item.update({
    where: {
      id
    },
    data: {
      title,
      description,
      category
    }
  })

  return c.json(toItemResponse(item), 200)
})

app.openapi(deleteItemRoute, async (c) => {
  const { id } = c.req.valid('param')

  await prisma.item.deleteMany({
    where: {
      id
    }
  })

  return c.body(null, 204)
})

app.openapi(cancelBookingRoute, async (c) => {
  const { id } = c.req.valid('param')

  const existingBooking = await prisma.booking.findUnique({
    where: {
      id
    }
  })

  if (!existingBooking) {
    return c.json({
      message: 'Booking not found.'
    }, 404)
  }

  const booking = await prisma.booking.update({
    where: {
      id
    },
    data: {
      status: 'cancelled'
    }
  })

  return c.json(toBookingResponse(booking), 200)
})

export type AppType = typeof app
