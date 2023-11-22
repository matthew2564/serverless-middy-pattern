import {UserProvider} from "../provider/UserProvider";

export const getUser = async (staffNumber: string): Promise<void> => {
    const user = new UserProvider().findUserRecord(staffNumber);

    if (!user) {
        throw new Error('User not found');
    }
}
