import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function getEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId",
    {
      schema: {
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          200: {
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              attendeesAmout: z.number().int(),
            }),
          },
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const event = await prisma.event.findUnique({
        select: {
          id: true,
          title: true,
          slug: true,
          details: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        where: {
          id: eventId,
        },
      });
      if (event === null) {
        throw new Error("Event not found");
      }
      return reply.send({
        id: event.id,
        title: event.title,
        slug: event.slug,
        details: event.details,
        maximumAttendees: event.maximumAttendees,
        attendees: event._count.attendees,
      });
    },
  );
}
