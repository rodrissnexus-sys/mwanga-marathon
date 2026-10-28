import { useState } from 'react';
import { registerParticipant } from '../api/marathon/registration';

export const useMarathonRegistration = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [retryAfter, setRetryAfter] = useState(null);

    const handleRegistration = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        setValidationErrors({});
        setRetryAfter(null);

        try {
            const result = await registerParticipant(formData);

            if (!result.success) {
                if (result.validationErrors) {
                    setValidationErrors(result.validationErrors);
                } else if (result.retryAfter) {
                    setRetryAfter(result.retryAfter);
                }
                setError(result.error);
                return null;
            }

            return result.data; // the saved registration (registration_id, event, …)
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        handleRegistration,
        isSubmitting,
        error,
        validationErrors,
        retryAfter
    };
};
