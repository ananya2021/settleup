export type GroupMemberRole = 'admin' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Group {
  readonly id: string;
  readonly name: string;
  readonly createdBy: string;
  readonly createdAt: Date;
}

export interface GroupMember {
  readonly groupId: string;
  readonly userId: string;
  readonly role: GroupMemberRole;
  readonly joinedAt: Date;
}

export interface GroupInvitation {
  readonly id: string;
  readonly groupId: string;
  readonly inviterId: string;
  readonly inviteeEmail: string;
  readonly status: InvitationStatus;
  readonly createdAt: Date;
  readonly expiresAt: Date;
}
