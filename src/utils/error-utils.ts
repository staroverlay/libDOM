export type ErrorCode =
  | 'BAD_AUTH'
  | 'NO_AUTH'
  | 'ALREADY_AUTH'
  | 'NO_INTEGRATION'
  | 'UNKNOWN';
export type ErrorMessages = { title: string; message: string };

const Errors: { [key in ErrorCode]: ErrorMessages } = {
  BAD_AUTH: {
    title: 'Widget not found',
    message: "Widget with this URL doesn't exist or has expired.",
  },
  NO_AUTH: {
    title: 'No authenticated',
    message: 'You must authenticate in order to use this function.',
  },
  ALREADY_AUTH: {
    title: 'Already authenticated',
    message: 'This widget is already authenticated',
  },
  NO_INTEGRATION: {
    title: 'No integration found',
    message:
      "Account linked to this widget doesn't have integrations or has expired.",
  },
  UNKNOWN: {
    title: 'Unknown Error',
    message: 'An unknown error has ocurred while trying to render this widget.',
  },
};

export function getError(code: ErrorCode | string) {
  if (code.startsWith('NO_TOPIC_')) {
    const topic = code.split('NO_TOPIC_')[1];
    return {
      title: 'Cannot register topic',
      message: `Topic named ${topic} not found.`,
    };
  }

  if (code.startsWith('ALREADY_SUBSCRIBED_')) {
    const topic = code.split('ALREADY_SUBSCRIBED_')[1];
    return {
      title: 'Cannot register topic',
      message: `Already subscribed to ${topic}.`,
    };
  }

  const obj = Errors[code as ErrorCode];
  return obj ? obj : Errors.UNKNOWN;
}

export default Errors;
