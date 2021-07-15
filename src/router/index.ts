import branding from '@/branding';
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

  // Terminal Mode
  {
    path: '/terminal/',
    component: () => import('../views/terminal/TerminalHome.vue'),
    meta: {
      allowGuests: true,
      hideChrome: true,
    },
  },
  {
    path: '/terminal/employees/:id/',
    component: () => import('../views/terminal/AuthenticatedTracking.vue'),
    meta: {
      allowGuests: true,
      hideChrome: true,
    },
  },
  {
    path: '/terminal/not-assigned-to-institution/',
    component: () => import('../views/terminal/NotAssignedToInstitution.vue'),
    meta: {
      allowGuests: true,
      hideChrome: true,
    },
  },
  {
    path: '/terminal/token/:id/not-assigned/',
    component: () => import('../views/terminal/TokenNotAssignedToEmployee.vue'),
    meta: {
      allowGuests: true,
      hideChrome: true,
    },
  },
  {
    path: '/terminal/guest/',
    component: () => import('../views/terminal/Guest.vue'),
    meta: {
      allowGuests: true,
      hideChrome: true,
    },
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
    name: 'employees:list',
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
    path: '/tokens/add/',
    component: () => import('../views/TokensAdd.vue'),
    meta: { permissionSpace: 'physical_tokens' },
  },
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
    name: 'support',
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
  {
    path: '/account/institution/',
    component: () => import('../views/Institution.vue'),
    // meta: { permissionSpace: 'acc' },
  },

  // Absences
  {
    path: '/my-absences/applications/add/',
    component: () => import('../views/EmployeeAbsenceDetail.vue'),
    meta: { permissionSpace: 'absence-applications' },
  },
  {
    path: '/my-absences/applications/:id/',
    component: () => import('../views/EmployeeAbsenceDetail.vue'),
    meta: { permissionSpace: 'absence-applications' },
  },
  {
    path: '/my-absences/',
    component: () => import('../views/EmployeeAbsence.vue'),
    meta: { permissionSpace: 'absence' },
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

  // Account
  {
    name: 'license',
    path: '/account/license/',
    component: () => import('../views/License.vue'),
    meta: { permissionSpace: 'licenses' },
  },
  {
    name: 'data-processing-agreement',
    path: '/account/data-processing-agreement/',
    component: () => import('../views/DataProcessingAgreement.vue'),
    meta: { permissionSpace: 'contracts' },
  },

  // Startpage
  {
    path: '',
    component: () => import('../views/Home.vue'),
    // redirect: { path: '/time-tracking/',},
    meta: {
      allowGuests: true,
      hideChrome: true,
      transparentStatusBar: true,
    }
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
      next({ name: 'employees:list' });
    return
  }

  next();
});

// Set title
const setTitle = function(c: any) {
    const title = c.title;
    if (!title) return;
    document.title = title + " – " + branding.name;
}

router.beforeEach((to, _from, next) => {
    // console.log(to.matched[0]);
    const component = (to.matched[0].components.default as any);
    if (typeof component == 'function') {
        component().then((c: any) => setTitle(c.default))
    } else {
        setTitle(component)
    }

    next();
});

export default router
