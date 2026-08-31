export type NotificationType =
  | 'invitation'
  | 'expense_created'
  | 'settlement_received'
  | 'cancellation'
  | 'reversal'
  | 'reminder';

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly body: string;
  readonly data: Record<string, unknown>;
  readonly read: boolean;
  readonly createdAt: Date;
}
