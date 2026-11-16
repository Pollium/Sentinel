import BaseController from '../controllers/BaseController';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface Discovered{
    controllers: Array<new () => BaseController>;
    entities: Function[];
}

export default class ModuleDiscovery{
    constructor(private readonly modulesDir: string){}

    async discover(): Promise<Discovered>{
        const names = (await readdir(this.modulesDir, { withFileTypes: true }))
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();

        const discovered: Discovered = { controllers: [], entities: [] };

        for(const name of names){
            discovered.controllers.push(...await this.#loadDefaults<new () => BaseController>(name, 'controllers'));
            discovered.entities.push(...await this.#loadDefaults<Function>(name, 'models'));
        }

        return discovered;
    }

    async #loadDefaults<T>(moduleName: string, category: string): Promise<T[]>{
        const dir = join(this.modulesDir, moduleName, category);

        let files: string[];
        try{
            files = await readdir(dir);
        }catch{
            return [];
        }

        const loaded: T[] = [];
        for(const file of files.sort()){
            if(!file.endsWith('.ts') || file.endsWith('.d.ts')) continue;
            const imported = await import(pathToFileURL(join(dir, file)).href) as { default?: T };
            if(imported.default) loaded.push(imported.default);
        }
        return loaded;
    }
}
