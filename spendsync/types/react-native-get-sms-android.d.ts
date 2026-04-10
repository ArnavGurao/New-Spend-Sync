// Type declaration for react-native-get-sms-android
declare module 'react-native-get-sms-android' {
  interface SMSListOptions {
    box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued';
    minDate?: number;
    maxDate?: number;
    bodyRegex?: string;
    indexFrom?: number;
    maxCount?: number;
    address?: string;
    read?: 0 | 1;
    _id?: string;
    thread_id?: string;
  }

  const SmsAndroid: {
    list(
      filter: string,
      failureCallback: (error: string) => void,
      successCallback: (count: number, smsList: string) => void
    ): void;
  };

  export default SmsAndroid;
}
