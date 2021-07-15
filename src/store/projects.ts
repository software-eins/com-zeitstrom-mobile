import { BaseStore, StoreResponse } from './_base';

import { Project, projectService } from '../services/projects';


class ProjectStore extends BaseStore<Project> {}

export const projectStore = new ProjectStore("projects", projectService, 60 * 60 * 24);
