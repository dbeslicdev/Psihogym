import courses from "./content/curriculum.json" with { type: "json" };
export { programPrice } from "../src/content/program-pricing.js";

// Explicit public fields. Media URLs and the actual lesson content stay on the server.
export const programi = Object.entries(courses).map(([id, course]) => ({
  id,
  status: "active",
  title: course.title,
  description: course.description,
  days: course.days,
  workbook: course.workbook,
  accessDays: course.accessDays,
  price: course.price,
  promoPrice: course.promoPrice,
  promotionDays: course.promotionDays,
  audience: course.audience,
  activities: course.activities,
  benefits: course.benefits,
  benefitsNote: course.benefitsNote,
  operation: course.operation,
  duration: course.duration,
  access: course.access,
  unsuitable: course.unsuitable,
  priceDescription: course.priceDescription,
  basis: course.basis,
  introduction: course.introduction,
  bibliography: course.bibliography,
  modules: course.modules.map(({ id, title, description, lessons }) => ({
    id, title, description,
    lessons: lessons.map(({ id, title, type, description }) => ({ id, title, type, description })),
  })),
}));

export const programiById = Object.fromEntries(programi.map(program => [program.id, program]));
