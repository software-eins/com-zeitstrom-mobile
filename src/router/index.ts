import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import { accountService } from '../services/accounts';

const routes: Array<RouteRecordRaw> = [

  {
    name: 'authentication:login',
    path: '/authentication/login/',
    component: () => import ('../views/authentication/Login.vue'),
    meta: {
        allowGuests: true,
        hideChrome: true,
        transparentStatusBar: true,
    },
  },

  // Time Tracking
  {
    path: '/time-tracking/',
    component: () => import('../views/TimeTracking.vue'),
    meta: {
      requiresEmployee: true,
    }
  },

  // Projects
  {
    path: '/projects/add/',
    component: () => import('../views/ProjectsDetail.vue'),
    meta: { permissionSpace: 'projects' },
  },
  {
    path: '/projects/:id/',
    component: () => import('../views/ProjectsDetail.vue'),
    meta: { permissionSpace: 'projects' },
  },
  {
    path: '/projects/',
    component: () => import('../views/Projects.vue'),
    meta: { permissionSpace: 'projects' },
  },

  // Employee Groups
  {
    path: '/departments/:id/employees/',
    component: () => import('../views/DepartmentsEmployees.vue'),
    meta: { permissionSpace: 'employee_groups' },
  },
  {
    path: '/departments/add/',
    component: () => import('../views/DepartmentsDetail.vue'),
    meta: { permissionSpace: 'employee_groups' },
  },
  {
    path: '/departments/:id/',
    component: () => import('../views/DepartmentsDetail.vue'),
    meta: { permissionSpace: 'employee_groups' },
  },
  {
    path: '/departments/',
    component: () => import('../views/Departments.vue'),
    meta: { permissionSpace: 'employee_groups' },
  },

  // Devices
  {
    path: '/devices/add/',
    component: () => import('../views/DevicesDetail.vue'),
    meta: { permissionSpace: 'devices' },
  },
  {
    path: '/devices/:id/',
    component: () => import('../views/DevicesDetail.vue'),
    meta: { permissionSpace: 'devices' },
  },
  {
    path: '/devices/',
    component: () => import('../views/Devices.vue'),
    meta: { permissionSpace: 'devices' },
  },

  // Timespans
  {
    path: '/timespans/:id/',
    component: () => import('../views/TimespansDetail.vue'),
    meta: { permissionSpace: 'timespans' },
  },

  // Employees
  {
    path: '/employees/add/',
    component: () => import('../views/EmployeesDetail.vue'),
    meta: { permissionSpace: 'employees' },
  },
  {
    path: '/employees/:id/',
    component: () => import('../views/EmployeesDetail.vue'),
    meta: { permissionSpace: 'employees' },
  },
  {
    path: '/employees/',
    component: () => import('../views/Employees.vue'),
    meta: { permissionSpace: 'employees' },
  },
  {
    path: '/employees/',
    component: () => import('../views/Employees.vue'),
    meta: { permissionSpace: 'employees' },
  },

  // Tokens
  {
    path: '/tokens/',
    component: () => import('../views/Tokens.vue'),
    meta: { permissionSpace: 'physical_tokens' },
  },

  // Support
  {
    name: 'support:contact',
    path: '/support/contact/',
    component: () => import('../views/SupportForm.vue'),
    meta: { permissionSpace: 'support_tickets' },
  },
  {
    path: '/support/',
    component: () => import('../views/Support.vue'),
    meta: { permissionSpace: 'support_tickets' },
  },

  // Account
  {
    path: '/account/profile/',
    component: () => import('../views/UserAccount.vue'),
    // meta: { permissionSpace: 'acc' },
  },

  // Reports
  {
    name: 'reports:employee:working-time-transactions',
    path: '/reports/employees/:year/:month/:employeeId/working-time-transactions/',
    component: () => import('../views/EmployeeReportWorkingTimeTransactions.vue'),
    meta: { permissionSpace: 'monthly_report' },
  },
  {
      name: 'reports:employee:params',
      path: '/reports/employees/:year/:month/:employeeId/',
      component: () => import('../views/EmployeeReport.vue'),
      meta: { permissionSpace: 'monthly_report' },
  },
  {
    path: '/reports/employees/',
    component: () => import('../views/EmployeeReport.vue'),
      meta: { permissionSpace: 'monthly_report' },
  },

  // Debug
  {
    path: '/debug/',
    component: () => import('../views/Debug.vue')
  },

  // Errors
  {
    name: 'errors',
    path: '/errors/:type/',
    component: () => import('../views/Error.vue'),
    meta: {
      hideChrome: true,
    },
  },

  // Startpage
  {
    path: '',
    // component: () => import('../components/ui/ZeitTabMenu.vue')
    redirect: { path: '/time-tracking/',},
  },

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Check if this view is allowed for guests
router.beforeEach((to, _from, next) => {
    const isGuest = localStorage.accessToken === undefined;

    if (to.meta.allowGuests || (!isGuest)) {
        next();
        return
    }
    next({name: 'authentication:login', query: {next: to.fullPath}});
});


// Check if this view is allowed for non-employees
router.beforeEach(async (to, _from, next) => {
  if (!to.meta.requiresEmployee) {
    next();
    return
  }

  const account = (await accountService.list()).data.results[0];
  if (!account || !account.employee_id) {
    next({ name: 'errors', params: { type: 'no-employee-assigned' } });
    return
  }

  next();
});

export default router
