export interface InviteInput{
    /** @format email */
    email: string;
}

export interface AcceptInvitationInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /** @minLength 8 */
    password: string;
}
