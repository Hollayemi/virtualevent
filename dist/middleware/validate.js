"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false, // collect all errors, not just the first
        stripUnknown: true, // remove keys not defined in the schema
        convert: true, // coerce types (e.g. "true" → true)
    });
    if (error) {
        const errors = error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/['"]/g, ''), // strip Joi's surrounding quotes
        }));
        res.status(422).json({
            success: false,
            type: 'validation_error',
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString(),
        });
        return;
    }
    // Replace body with the coerced value (includes Joi defaults)
    req.body = value;
    next();
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map