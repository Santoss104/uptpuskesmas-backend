import Joi from "joi";

export const patientSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name should only contain letters and spaces",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name cannot exceed 100 characters",
    }),

  address: Joi.string().trim().min(5).max(500).required().messages({
    "string.min": "Address must be at least 5 characters long",
    "string.max": "Address cannot exceed 500 characters",
  }),

  registrationNumber: Joi.string()
    .trim()
    .pattern(/^\d{2}\.\d{2}\.\d{2}\.\d{2}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Registration number format must be XX.XX.XX.XX (8 digits with dots)",
    }),

  birthPlace: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Birth place should only contain letters and spaces",
      "string.min": "Birth place must be at least 2 characters long",
      "string.max": "Birth place cannot exceed 100 characters",
    }),

  birthDay: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "string.pattern.base": "Birth day must be in YYYY-MM-DD format",
    }),
});

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
  }),

  password: Joi.string()
    .min(process.env.NODE_ENV === "production" ? 8 : 6)
    .pattern(
      process.env.NODE_ENV === "production"
        ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+\-_=])[A-Za-z\d@$!%*?&#+\-_=]{8,}$/
        : /^.{6,}$/
    )
    .required()
    .messages({
      "string.min":
        process.env.NODE_ENV === "production"
          ? "Password must be at least 8 characters long"
          : "Password must be at least 6 characters long",
      "string.pattern.base":
        process.env.NODE_ENV === "production"
          ? "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#+-_=)"
          : "Password must be at least 6 characters long",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),

  avatar: Joi.object({
    public_id: Joi.string().required(),
    url: Joi.string().uri().required(),
  }).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),

  password: Joi.string().required(),
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessage,
      });
    }

    next();
  };
};
