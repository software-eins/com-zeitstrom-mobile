import { AxiosResponse } from 'axios';


import { StorableBaseService, Id, PaginatedResponse } from '../services/_base';

export const registry: Array<BaseStore<Id>> = new Array<BaseStore<Id>>();

export class LocalResource<T extends Id> {
  createdAt: Date;
  lastSynch?: Date;
  entry: T;

  constructor(entry: T, lastSynch?: Date) {
    this.entry = entry;
    this.createdAt = new Date();
    this.lastSynch = lastSynch;
  }
}

export enum StoreResponseError {
  NO_INTERNET = "NO_INTERNET",
  NO_REMOTE_RESOURCE = "NO_REMOTE_RESOURCE",
  NO_AUTHENTICATION = "NO_AUTHENTICATION",
  SERVER_ERROR = "SERVER_ERROR",
}

export class StoreResponse<T extends Id> {
  error?: StoreResponseError;
  resource?: LocalResource<T>;

  constructor(resource: LocalResource<T>|undefined, error?: StoreResponseError) {
    this.resource = resource;
    this.error = error;
  }
}

export abstract class BaseStore<T extends Id> {
  resourceName: string;
  service: StorableBaseService<T>;
  updateInterval: number;

  lastUpdate: Date | undefined;

  resources: Map<string, LocalResource<T>>;
  updateTimer: undefined | NodeJS.Timeout;

  getResourceName(): string {
    if (this.resourceName == 'base')
      throw Error("`resourceName` is not assigned in subclass");

    return 'store__' + this.resourceName;
  }

  constructor(resourceName: string, service: StorableBaseService<T>, updateInterval: number) {
    this.resourceName = resourceName;
    this.service = service;
    this.updateInterval = updateInterval;

    // Load resources
    try {
      const key = this.getResourceName()
      const entriesRaw = localStorage.getItem(key);
      const entries = JSON.parse(entriesRaw as any);
      this.resources = new Map(entries);
    } catch {
      this.resources = new Map();
    }

    // Load last update timestamp
    try {
      const key = this.getResourceName() + "__lastUpdate";
      const lastUpdate = localStorage.getItem(key);
      if (lastUpdate) this.lastUpdate = new Date(lastUpdate);
    } catch {
      this.lastUpdate = undefined;
    }

    // Initialize update timer
    if (this.updateInterval > 0) {
      this.retrieveAll();

      this.updateTimer = setInterval(() => {
        this.retrieveAll();
      }, this.updateInterval * 1000)
    }

    // Add to registry
    registry.push(this);
  }

  commit() {
    const entryIterator = this.resources.entries();
    const entryList = Array.from(entryIterator);
    const entriesRaw = JSON.stringify(entryList);
    const key = this.getResourceName()

    localStorage.setItem(key, entriesRaw);
    if (this.lastUpdate) {
      localStorage.setItem(key + "__lastUpdate", this.lastUpdate.toISOString());
    } else {
      localStorage.removeItem(key + "__lastUpdate");
    }
  }

  unsynchedResources() {
    return Array.from(this.resources.values()).filter(res => !res.lastSynch);
  }

  set(resource: T, lastSynch?: Date, autocommit=true): LocalResource<T> {
    const localResource = new LocalResource<T>(resource, lastSynch);
    this.resources.set(resource.id, localResource);

    if (autocommit) this.commit();

    return localResource;
  }

  delete(resource: T, autocommit=true) {
    this.resources.delete(resource.id);
    if (autocommit) this.commit();
  }

  clear(autocommit=true) {
    this.resources = new Map();
    if (autocommit) this.commit();
  }

  get(id: string): LocalResource<T>|undefined {
    return this.resources.get(id);
  }

  async retrieveAll() {
    // Only retrieve all again, if at least half of the update interval passed
    if (
      this.lastUpdate &&
      (Number(new Date()) - Number(this.lastUpdate)) / 1000 < this.updateInterval / 2
    ) return;

    let resources: Array<T> = [];

    let page = 1;
    let response: AxiosResponse<PaginatedResponse<T>>|undefined;

    this.service.clearCache();

    while (!response || response.data.next) {
      response = await this.service.list(page, 1000);
      resources = resources.concat(response.data.results);
      page += 1;
    }

    this.lastUpdate = new Date();
    this.clear(false);
    for (const resource of resources) this.set(resource, new Date(), false);
    this.commit();
  }

  retrieve(
    id: string,
    localRetrievalFn?: (id: string) => LocalResource<T>|undefined,
    remoteRetrievalFn?: (id: string) => Promise<T>,
  ): Promise<StoreResponse<T>> {
    return new Promise(resolve => {
      let storeResponse: StoreResponse<T>;

      // Check if resource exists locally already
      let localResource;
      localRetrievalFn = localRetrievalFn || this.get.bind(this);
      localResource = localRetrievalFn(id);

      if (localResource) {
        storeResponse = new StoreResponse<T>(localResource);
        resolve(storeResponse);

        // Do not update the resource, TODO: Remove
        return;
      }

      // Try to load the resource remotely
      if (!remoteRetrievalFn) {
        remoteRetrievalFn = (id: string) => this.service.retrieve(id).then(response => {
          return response.data;
        });
      }

      remoteRetrievalFn(id).then(resource => {
        if (!storeResponse) {
          localResource = new LocalResource(resource);
          storeResponse = new StoreResponse<T>(localResource);
          resolve(storeResponse);
        } else if (storeResponse.resource) {
          storeResponse.resource.entry = resource;
          storeResponse.resource.lastSynch = new Date();
        } else {
          console.warn("store._base.BaseStore.retrieve: Invalid state reached");
        }
      }).catch(reason => {
        if (storeResponse) return;

        if (reason.response.status == 404) {
          resolve(new StoreResponse<T>(
            undefined, StoreResponseError.NO_REMOTE_RESOURCE
          ));
        } else {
          // or NO_INTERNET or NO_AUTHENTICATION or SERVER_ERROR?
          console.warn("store._base.BaseStore.retrieve", reason, reason.response.status);
        }
      });

    });
  }

}
