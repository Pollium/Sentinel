export interface SetupInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
    /** @format email */
    email: string;
    /** @minLength 8 */
    password: string;
}

export interface SignInInput{
    /** @format email */
    email: string;
    /** @minLength 8 */
    password: string;
}

export interface UpdateProfileInput{
    /**
     * @minLength 1
     * @maxLength 80
     */
    name: string;
}

export interface ChangePasswordInput{
    currentPassword: string;
    /** @minLength 8 */
    newPassword: string;
}
