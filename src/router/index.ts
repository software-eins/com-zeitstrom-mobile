import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [

  {
    name: 'authentication:login',
    path: '/authentication/login/',
    component: () => import ('../views/authentication/Login.vue'),
    meta: {
        allowGuests: true,
        hideChrome: true,
    },
  },

  // Time Tracking
  {
    path: '/time-tracking/',
    component: () => import('../views/TimeTracking.vue'),
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

  // Debug
  {
    path: '/debug/',
    component: () => import('../views/Debug.vue')
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

router.beforeEach((to, _from, next) => {
    const isGuest = localStorage.accessToken === undefined;

    if (to.meta.allowGuests || (!isGuest)) {
        next();
        return
    }

    next({name: 'authentication:login', query: {next: to.fullPath}});

});

export default router
