import { Routes } from "@angular/router";
import { LoginGuard } from "./services/login.guard";
import { AuthGuard } from "./services/auth.guard";
import { PermissionGuard } from "./services/permission.guard";
import { AccessDeniedComponent } from "./authorize-screens/access-denied/access-denied.component";

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    {
        path: 'client',
        canMatch: [LoginGuard],
        loadComponent: () => import('./home/client/client.component'). then(m => m.ClientComponent)
    },
    {
        path: '',
        canMatch: [AuthGuard],
        loadComponent: () => import('./home/layout/layout.component'). then(m => m.LayoutComponent),
        children: [
            {
                path: 'system-settings', 
                loadComponent: () => import('./home/system-settings/system-settings.component'). then(m => m.SystemSettingsComponent),
                canActivate: [PermissionGuard],
                data: { requiredPermission: '2.1' },
            },
            {
                path: 'it-equipment',
                loadComponent: () => import('./authorize-screens/it-equipment/it-equipment.component'). then(m => m.ItEquipmentComponent),
                canActivate: [PermissionGuard],
                data: { requiredPermission: '4.2'}
            },
            {
                // path: 'register-device', 
                // loadComponent: () => import('./authorize-screens/register-device/register-device.component'). then(m => m.RegisterDeviceComponent),
                path: 'maintenance-logs', 
                loadComponent: () => import('./authorize-screens/it-equipment/maintenance-logs/maintenance-logs.component'). then(m => m.MaintenanceLogsComponent),
                data: { requiredPermission: '4.3' },
                canActivate: [PermissionGuard],
            },
            {
                path: 'checklist-records', 
                loadComponent: () => import('./authorize-screens/it-equipment/checklist-records/checklist-records.component'). then(m => m.ChecklistRecordsComponent),
                data: { requiredPermission: '4.3' },
                canActivate: [PermissionGuard],
            },
            {
                path: 'dashboard', 
                loadComponent: () => import('./authorize-screens/dashboard-screen/dashboard-screen.component'). then(m => m.DashboardScreenComponent),
                data: { requiredPermission: '3.4' },
                canActivate: [PermissionGuard],
            },
            {
                // path: 'office request',
                path: 'authorize/office-request', 
                loadComponent: () => import('./authorize-screens/office-screen/office-screen.component'). then(m => m.OfficeScreenComponent),
                data: { requiredPermission: '5.1' },
                canActivate: [PermissionGuard],
            },
           {
                // path: 'support request',
                path: 'authorize/support-request', 
                loadComponent: () => import('./authorize-screens/support-screen/support-screen.component').then(m => m.SupportScreenComponent),
                data: { requiredPermission: '5.2' },
                canActivate: [PermissionGuard],
            },
           {
                // path: 'monitor',
                path: 'authorize/monitor', 
                loadComponent: () => import('./authorize-screens/monitor-screen/monitor-screen.component').then(m => m.MonitorComponent),
                data: { requiredPermission: '5.3' },
                canActivate: [PermissionGuard],
            },
            {
                // path: 'task',
                path: 'authorize/task' ,
                loadComponent: () => import('./authorize-screens/assigned-task-screen/assigned-task-screen.component'). then(m => m.AssignedTaskScreenComponent),
                data: { requiredPermission: '3.5' },
                canActivate: [PermissionGuard],
            },

            { path: 'access-denied', component: AccessDeniedComponent },
        ]
    },

    
]



