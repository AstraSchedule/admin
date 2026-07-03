import {createRouter, createWebHistory} from "vue-router";
import {isLoggedIn} from '@/auth.js'

const router = createRouter(
    {
        history: createWebHistory(),
        routes: [
            {
                path: '/login',
                name: 'Login',
                component: () => import("../views/Login.vue"),
                meta: {noAuth: true}
            },
            {
                path: '/change-password',
                name: 'ChangePassword',
                component: () => import("../views/ChangePassword.vue")
            },
            {
                path: '/',
                name: 'Home',
                component: () => import("../views/Home.vue")
            },
            {
                path: '/users',
                name: 'Users',
                component: () => import("../views/Users.vue")
            },
            {
                path: '/structure',
                name: 'Structure',
                component: () => import("../views/Structure.vue")
            },
            {
                path: '/autorun',
                name: 'Autorun',
                component: () => import("../views/Autorun.vue")
            },
            {
                path: '/autorun/add',
                name: 'AutorunAdd',
                component: () => import("../views/AddAutorunConfig.vue")
            },
            {
                path: '/autorun/edit/:id',
                name: 'AutorunEdit',
                component: () => import("../views/AddAutorunConfig.vue")
            },
            {
              path: '/countdown',
              name: 'Countdown',
              component: () => import("../views/Countdown.vue")
            },
          {
            path: '/countdown/add',
            name: 'CountdownAdd',
            component: () => import("../views/AddCountdown.vue")
          },
          {
            path: '/countdown/edit/:id',
            name: 'CountdownEdit',
            component: () => import("../views/AddCountdown.vue")
          },
          {
                path: '/config/:school/:grade/subjects',
                name: 'Subjects',
                component: () => import("../views/SubjectsConfig.vue")
            },
            {
                path: '/config/:school/:grade/timetable',
                name: 'Timetable',
                component: () => import("../views/TimetableConfig.vue")
            },
            {
                path: '/config/:school/:grade/:cls/schedule',
                name: 'Schedule',
                component: () => import("../views/ScheduleConfig.vue")
            },
            {
                path: '/config/:school/:grade/:cls/settings',
                name: 'Settings',
                component: () => import("../views/SettingsConfig.vue")
            },
            {
                path: '/tools',
                name: 'Tools',
                component: () => import("../views/Tools.vue")
            },
            {
                path: '/tools/compensation-import',
                name: 'CompensationImport',
                component: () => import("../views/CompensationImport.vue")
            },
            {
                path: '/404',
                name: '404',
                component: () => import("../views/NotFound.vue")
            },
            {
                path: '/:pathMatch(.*)',
                name: 'NotFound',
                redirect: '/404'
            }
        ]
    }
)

router.beforeEach((to, from, next) => {
  if (to.name === 'Login' && isLoggedIn()) {
    next('/')
    return
  }
  if (to.meta.noAuth) {
    next()
    return
  }
  if (!isLoggedIn()) {
    next('/login')
    return
  }
  next()
})

export default router
