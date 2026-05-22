<?php
use Phalcon\Mvc\Router;

$router = new Router();

/* --- SSL --- */
$baseUri='/ets/etsbackend';

/* --- PRODUCTION --- */
// $baseUri='https://ets.quezonsystems.com/';

    ////////////////////////
    /// Users 
    //////////////////////// 

/* ================= FETCH DIVISION (DROPDOWN SELECT) --- */
    $router->add($baseUri . '/divisions', [
    /* --- PRODUCTION --- */
    // $router->add($baseUri . 'etsbackend/users/divisions', [
        'controller' => 'client',
        'action'     => 'getDivisions'
    ]);

/* ================= CREATE SERVICE REPORT FROM CLIENT --- */  
    $router->add($baseUri . '/create', [
    /* --- PRODUCTION --- */
    // $router->add($baseUri . 'etsbackend/users/create', [
        'controller' => 'client',
        'action' => 'createServiceReport'
    ]);

/* ================= FETCH SERVICE REPOT BY ID --- */ 
    $router->add($baseUri . '/getServiceReportsByOfficeId', [
    /* --- PRODUCTION --- */
    // $router->add($baseUri . 'etsbackend/users/getServiceReportsByOfficeId', [
        'controller' => 'users',
        'action' => 'getServiceReportsByOfficeId'
    ]);

/* ================= FETCH ALL OFFICES --- */
    $router->add($baseUri . '/getAllOffices', [
    /* --- PRODUCTION --- */ 
    // $router->add($baseUri . 'etsbackend/users/getAllOffices', [
        'controller' => 'users',
        'action' => 'getAllOffices',
    ]);

    ////////////////////////
    /// System
    //////////////////////// 

    $router->add($baseUri . '/updateDivision', [
    // $router->add($baseUri . 'etsbackend/system/updateDivision', [
        'controller' => 'system',
        'action'     => 'updateDivision'
    ]);
    // $router->add($baseUri . 'etsbackend/system/addOffice', [
    $router->add($baseUri . '/addOffice', [
        'controller' => 'system',
        'action'     => 'addOffice'
    ]);
/* ================= CREATE NEW USER --- */
    $router->add($baseUri . '/addUser', [
    /* --- PRODUCTION --- */
    // $router->add($baseUri . 'etsbackend/system/register', [
        'controller' => 'system',
        'action'     => 'addUser',
    ]);
/* ================= GET ALL DIVISIONS --- */
    $router->add($baseUri . '/getAllDivisions', [
    // $router->add($baseUri . 'etsbackend/system/getAllDivisions', [
        'controller' => 'system',
        'action'     => 'getAllDivisions'
    ]);
/* ================= ADD PERSONNEL --- */
    $router->add($baseUri . '/addPersonnel', [
    // $router->add($baseUri . 'etsbackend/system/addPersonnel', [
        'controller' => 'system',
        'action'     => 'addPersonnel'
    ]);
/* ================= GET USER BY ID --- */
    $router->add($baseUri . '/getUserById/{id}', [
    // $router->add($baseUri . 'etsbackend/system/getUserById/{id}', [
        'controller' => 'system',
        'action'     => 'getUserById',
        'id'         => 1
    ]);

    $router->add($baseUri . '/getUserInfo', [
    // $router->add($baseUri . 'etsbackend/system/getUserInfo', [
        'controller' => 'system',
        'action'     => 'getUserInfo'
    ]);
    $router->add($baseUri . '/getAuthUserPerms', [
    // $router->add($baseUri . 'etsbackend/system/getAuthUserPerms', [
        'controller' => 'system',
        'action'     => 'getAuthUserPerms'
    ]);
    $router->add($baseUri . '/getUsers', [
    // $router->add($baseUri . 'etsbackend/system/getUsers', [
        'controller' => 'system',
        'action'     => 'getUsers'
    ]);
    $router->add($baseUri . '/getOffice', [
    // $router->add($baseUri . 'etsbackend/system/getOffice', [
        'controller' => 'system',
        'action'     => 'getOffice'
    ]);
    $router->add($baseUri . '/getAllOffices', [
    // $router->add($baseUri . 'etsbackend/system/getAllOffices', [
        'controller' => 'system',
        'action'     => 'getAllOffices'
    ]);

    ////////////////////////
    /// PMS
    //////////////////////// 

/* ================= For getting the personnels for maintenance logs --- */
    $router->add($baseUri . '/getITStaff', [
    // $router->add($baseUri . 'etsbackend/pms/getITStaff', [
        'controller' => 'pms',
        'action'     => 'getITStaff'
    ]);
/* ================= For view checklist template dialog  --- */
    $router->add(
        $baseUri . '/getChecklistTemplateDetails/{id}',
        // $baseUri . 'etsbackend/pms/getChecklistTemplateDetails/{id}',
        [
            'controller' => 'pms',
            'action' => 'getChecklistTemplateDetails',
            'id' => 1
        ]
    );
/* ================= For creating new checklist template  --- */
    $router->add(
        $baseUri . '/createChecklistTemplate',
        // $baseUri . 'etsbackend/pms/createChecklistTemplate',
        [
            'controller' => 'pms',
            'action' => 'createChecklistTemplate'
        ]
    );
/* ================= Equipment Types for IT Equipment  --- */
    $router->add($baseUri . '/getEquipmentTypes', [
    // $router->add($baseUri . 'etsbackend/pms/getEquipmentTypes', [
        'controller' => 'pms',
        'action'     => 'getEquipmentTypes'
    ]);

/* ================= Get Maintenance Log Detail --- */
$router->add($baseUri . '/pms/getMaintenanceLogDetail', [
    'controller' => 'pms',
    'action'     => 'getMaintenanceLogDetail'
]);
/* ================= Print PM Checklist PDF --- */
$router->add($baseUri . '/pms/printMaintenanceChecklist/{id}', [
    'controller' => 'pms',
    'action'     => 'printMaintenanceChecklist',
    'id'         => 1
]);

$router->handle($_SERVER['REQUEST_URI']);