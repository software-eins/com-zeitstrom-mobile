import { BaseStore, StoreResponse } from './_base';

import { Employee, employeeService } from '../services/employees';


class EmployeeStore extends BaseStore<Employee> {
  retrieveByToken(token: string): Promise<StoreResponse<Employee>> {
    return this.retrieve(
      token,
      (token: string) => {
        for (const resource of this.resources.values()) {
          if (resource.entry.physical_token_id == token) return resource;
        }
        return undefined;
      },
      (token: string) => {
        return new Promise((resolve, reject) => {
          employeeService.listParams({
            token: [token],
          }).then(response => {
            if (response.data.count == 0) {
              reject({response: {status: 404}});
              return
            }
            resolve(response.data.results[0]);
          }).catch(reason => reject(reason));
        })
      }
    )
  }
}

export const employeeStore = new EmployeeStore("employees", employeeService, 60 * 60 * 24);
