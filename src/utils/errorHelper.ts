/**
 * Extracts a friendly, descriptive error message from any given error object.
 * Handles nested validation errors (arrays and maps), serialized errors, and custom API messages.
 * Cleans up double quotes typically surrounding Joi validation field names for cleaner UI display.
 */
export const getErrorMessage = (err: any, fallback: string = 'An error occurred'): string => {
  if (!err) return fallback;

  // Check RTK query / Axios error style
  const data = err.data || err.response?.data;
  
  if (data) {
    // If we have custom validation errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((e: any) => {
          if (typeof e === 'string') return e.replace(/"/g, '');
          if (e && typeof e === 'object' && e.message) {
            return typeof e.message === 'string' ? e.message.replace(/"/g, '') : JSON.stringify(e.message);
          }
          return null;
        })
        .filter(Boolean)
        .join(', ');
    }

    // Sometimes validation errors is an object mapping field to messages or message array
    if (data.errors && typeof data.errors === 'object') {
      const messages: string[] = [];
      Object.keys(data.errors).forEach(key => {
        const val = data.errors[key];
        if (Array.isArray(val)) {
          messages.push(...val.map(v => typeof v === 'string' ? v.replace(/"/g, '') : JSON.stringify(v)));
        } else if (typeof val === 'string') {
          messages.push(val.replace(/"/g, ''));
        } else if (val && typeof val === 'object' && val.message) {
          messages.push(typeof val.message === 'string' ? val.message.replace(/"/g, '') : JSON.stringify(val.message));
        }
      });
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    // If there's a top level message/error string
    if (typeof data.message === 'string') {
      return data.message.replace(/"/g, '');
    }
    if (typeof data.error === 'string') {
      return data.error.replace(/"/g, '');
    }
  }

  // SerializedError style or plain Error object
  if (typeof err.message === 'string') {
    return err.message.replace(/"/g, '');
  }
  if (typeof err.error === 'string') {
    return err.error.replace(/"/g, '');
  }

  // Handle fetch base query custom text or other responses
  if (typeof err === 'string') {
    return err.replace(/"/g, '');
  }

  return fallback;
};
