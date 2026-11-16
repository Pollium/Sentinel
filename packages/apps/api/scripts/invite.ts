import 'reflect-metadata';
import 'dotenv/config';

import createApp from '@/core/Application';
import InvitationService from '@/modules/invitations/services/Invitation';

const [email] = process.argv.slice(2);

const run = async (): Promise<number> => {
    if(email === undefined){
        console.error('Usage: pnpm --filter @sentinel/api invite <email>');
        return 1;
    }

    const app = createApp();
    await app.build();

    try{
        const { url } = await new InvitationService().create({ email });
        console.log(url);
        return 0;
    }finally{
        await app.stop();
    }
};

process.exitCode = await run();
