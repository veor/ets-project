<?php
declare(strict_types=1);

class PMSController extends \Phalcon\Mvc\Controller
{
    ////////////////////////
    /// IT Equipment
    ////////////////////////   
    // Add New Device Information
    public function saveEquipmentAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody();

        try {

            $this->db->begin();

            // BASIC EQUIPMENT
            $eq = new ItEquipment();

            $eq->accountable_person = $data->accountablePerson;
            $eq->end_user = $data->endUser;
            $eq->designation = $data->designation;
            $eq->brand_type = $data->brandType;

            $eq->brand = $data->brand ?? null;
            $eq->model = $data->model ?? null;
            $eq->serial_number = $data->serialNumber ?? null;

            $eq->par_ics = $data->par;
            $eq->computer_name = $data->computerName;
            $eq->office_id = $data->department;
            $eq->division_id = $data->division;
            $eq->status = $data->status;

            if (!$eq->save()) {
                throw new Exception("Failed to save equipment");
            }

            $id = $eq->id;

            // EQUIPMENT TYPES
            if (!empty($data->equipmentType)) {
                foreach ($data->equipmentType as $type) {
                    $t = new DeviceEquipmentTypes();
                    $t->device_id = $id;
                    $t->equipment_type = $type;
                    $t->save();
                }
            }

            // HARDWARE
            $hw = new DeviceHardware();
            $hw->device_id = $id;

            $hw->motherboard_brand = $data->hardwareInformation->motherboard->brand ?? null;
            $hw->motherboard_serial = $data->hardwareInformation->motherboard->serial ?? null;

            $hw->processor_brand = $data->hardwareInformation->processor->brand ?? null;
            $hw->processor_serial = $data->hardwareInformation->processor->serial ?? null;

            $hw->monitor_brand = $data->hardwareInformation->monitor->brand ?? null;
            $hw->monitor_serial = $data->hardwareInformation->monitor->serial ?? null;

            $hw->gpu_brand = $data->hardwareInformation->gpu->brand ?? null;
            $hw->gpu_serial = $data->hardwareInformation->gpu->serial ?? null;

            $hw->ups_brand = $data->hardwareInformation->ups->brand ?? null;
            $hw->ups_serial = $data->hardwareInformation->ups->serial ?? null;

            $hw->printer_brand = $data->hardwareInformation->printer->brand ?? null;
            $hw->printer_serial = $data->hardwareInformation->printer->serial ?? null;

            $hw->data_cabinet_brand = $data->hardwareInformation->dataCabinet->brand ?? null;
            $hw->data_cabinet_serial = $data->hardwareInformation->dataCabinet->serial ?? null;

            $hw->network_switch_brand = $data->hardwareInformation->networkSwitch->brand ?? null;
            $hw->network_switch_serial = $data->hardwareInformation->networkSwitch->serial ?? null;

            $hw->save();

            // MEMORY (RAM / HDD / SSD)
            $memoryMap = [
                "RAM" => $data->hardwareInformation->memorySlots ?? [],
                "HDD" => $data->hardwareInformation->hddSlots ?? [],
                "SSD" => $data->hardwareInformation->ssdSlots ?? []
            ];

            foreach ($memoryMap as $type => $slots) {
                foreach ($slots as $slot) {

                    if (empty($slot->brand) && empty($slot->serial)) {
                        continue;
                    }

                    $mem = new DeviceMemory();
                    $mem->device_id = $id;
                    $mem->type = $type;
                    $mem->brand = $slot->brand;
                    $mem->serial = $slot->serial;
                    $mem->save();
                }
            }

            // SOFTWARE
            $sw = new DeviceSoftware();
            $sw->device_id = $id;

            $sw->computer_name = $data->softwareInformation->computerName ?? null;
            $sw->operating_system = $data->softwareInformation->operatingSystem ?? null;
            $sw->os_license_key = $data->softwareInformation->osLicenseKey ?? null;
            $sw->productivity_suite = $data->softwareInformation->productivitySuite ?? null;
            $sw->productivity_license_key = $data->softwareInformation->productivityLicenseKey ?? null;
            $sw->endpoint_protection = $data->softwareInformation->endpointProtection ?? null;
            $sw->bitlocker_key = $data->softwareInformation->bitLockerKey ?? null;
            $sw->device_name = $data->softwareInformation->deviceName ?? null;

            $sw->save();

            // NETWORK
            $net = new DeviceNetwork();
            $net->device_id = $id;

            $net->ip_address = $data->networkInformation->ipAddress ?? null;
            $net->mac_address = $data->networkInformation->macAddress ?? null;
            $net->internet_access = $data->networkInformation->internetAccess ?? null;
            $net->connection_type = $data->networkInformation->connectionType ?? null;
            $net->internet_permission = $data->networkInformation->internetPermission ?? null;

            $net->save();

            $this->db->commit();

            return $this->response->setJsonContent([
                "status" => "success",
                "message" => "Equipment saved successfully",
                "id" => $id
            ]);

        } catch (Exception $e) {

            $this->db->rollback();

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    public function getOfficesAction()
    {
        $offices = Office::find();
    
        $officeData = [];
    
        foreach ($offices as $office) {
            $officeData[] = [
                'office_id' => $office->office_id,
                'office_name' => $office->office_name,
                'office_value' => $office->office_value
            ];
        }
    
        return $this->response->setJsonContent(['data' => $officeData]);
    }    
    public function getDivisionsAction()
    {
        $this->view->disable(); 

        $divisions = Divisions::find(); 

        $divisionData = [];
    
        foreach ($divisions as $division) {
            $divisionData[] = [
                'division_id' => $division->division_id,
                'division_name' => $division->division_name,
                'office_id'=> $division->office_id
            ];
        }
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $divisionData
        ]);

        if ($divisions) {
            $response = [
                'status' => 'success',
                'data' => $divisions->toArray() 
            ];
        } else {
            $response = [
                'status' => 'fail',
                'message' => 'No divisions found.'
            ];
        }

        $this->response->setJsonContent($response);
        return $this->response->send();
    }
    // Get IT Equipment 
    public function getEquipmentListAction()
    {
        $this->view->disable();

        try {
            $conditions = "1=1";
            $bind = [];

            if ($this->request->getQuery('search')) {
                $search = $this->request->getQuery('search');
                $conditions .= " AND (
                    computer_name LIKE :search:
                    OR end_user LIKE :search:
                    OR accountable_person LIKE :search:
                    OR par_ics LIKE :search:
                )";
                $bind['search'] = "%$search%";
            }

            if ($this->request->getQuery('status')) {
                $conditions .= " AND status = :status:";
                $bind['status'] = $this->request->getQuery('status');
            }

            if ($this->request->getQuery('equipmentType')) {
                $conditions .= " AND id IN (
                    SELECT device_id
                    FROM DeviceEquipmentTypes
                    WHERE equipment_type = :equipmentType:
                )";
                $bind['equipmentType'] = $this->request->getQuery('equipmentType');
            }

            $page = (int)$this->request->getQuery('page', 'int', 1);
            $limit = (int)$this->request->getQuery('limit', 'int', 10);
            $offset = ($page - 1) * $limit;

            $order = "id DESC";

            if ($this->request->getQuery('sortColumn')) {
                $sortColumn = $this->request->getQuery('sortColumn');
                $sortDirection = strtoupper($this->request->getQuery('sortDirection')) === 'DESC' ? 'DESC' : 'ASC';
                $allowed = [
                    'computer_name',
                    'end_user',
                    'accountable_person',
                    'status',
                    'par_ics'
                ];

                if (in_array($sortColumn, $allowed)) {
                    $order = "$sortColumn $sortDirection";
                }
            }

            $total = ItEquipment::count([
                "conditions" => $conditions,
                "bind" => $bind
            ]);

            $equipments = ItEquipment::find([
                "conditions" => $conditions,
                "bind" => $bind,
                "order" => $order,
                "limit" => $limit,
                "offset" => $offset
            ]);

            $offices = Office::find();
            $officeMap = [];

            foreach ($offices as $o) {
                $officeMap[$o->office_id] = $o->office_value;
            }

            $divisions = Divisions::find();
            $divisionMap = [];

            foreach ($divisions as $d) {
                $divisionMap[$d->division_id] = $d->division_name;
            }

            $result = [];
            foreach ($equipments as $eq) {
                $types = DeviceEquipmentTypes::find([
                    "conditions" => "device_id = ?0",
                    "bind" => [$eq->id]
                ]);

                $equipmentTypes = [];

                foreach ($types as $t) {
                    $equipmentTypes[] = $t->equipment_type;
                }

                $existingChecklist =
                    MaintenanceChecklistLogs::findFirst([
                        "conditions" => "
                            equipment_id = :equipment_id:
                        ",
                        "bind" => [
                            "equipment_id" => $eq->id
                        ]
                    ]);

                $result[] = [
                    "id" => $eq->id,
                    "computerName" => $eq->computer_name,
                    "endUser" => $eq->end_user,
                    "accountablePerson" => $eq->accountable_person,
                    "department" => $officeMap[$eq->office_id] ?? null,
                    "division" => $divisionMap[$eq->division_id] ?? null,
                    "equipmentType" => $equipmentTypes,
                    "par" => $eq->par_ics,
                    "status" => $eq->status,
                    "hasChecklist" => $existingChecklist ? true : false
                ];
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "data" => $result,
                "pagination" => [
                    "currentPage" => $page,
                    "totalPages" => ceil($total / $limit),
                    "totalRecords" => $total
                ]
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    public function getEquipmentTypesAction()
    {
        $this->view->disable();
        try {

            $types = DeviceEquipmentTypes::find([
                "columns" => "DISTINCT equipment_type",
                "order" => "equipment_type ASC"
            ]);

            $result = [];

            foreach ($types as $t) {

                if (!empty($t->equipment_type)) {
                    $result[] = $t->equipment_type;
                }
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "data" => $result
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    // Get checklist tasks by equipment type and year
    public function getChecklistTasksAction()
    {
        $this->view->disable();

        try {

            $equipmentType =
                $this->request->getQuery('equipmentType');

            $versionYear =
                $this->request->getQuery('versionYear');

            if (!$equipmentType || !$versionYear) {

                return $this->response->setJsonContent([
                    "status" => "error",
                    "message" => "Equipment type and version year are required"
                ]);
            }

            // Find matching template
            $template = MaintenanceChecklistTemplates::findFirst([

                "conditions" => "
                    is_active = 1
                    AND equipment_type = :equipment_type:
                    AND version_year = :version_year:
                ",

                "bind" => [
                    "equipment_type" => $equipmentType,
                    "version_year" => $versionYear
                ]
            ]);

            if (!$template) {

                return $this->response->setJsonContent([
                    "status" => "error",
                    "message" => "Checklist template not found"
                ]);
            }

            // Get tasks
            $tasks = MaintenanceChecklistTasks::find([

                "conditions" => "
                    template_id = :template_id:
                    AND is_active = 1
                ",

                "bind" => [
                    "template_id" => $template->id
                ],

                "order" => "task_order ASC"
            ]);

            $result = [];

            foreach ($tasks as $task) {

                $result[] = [
                    "id" => $task->id,
                    "task_order" => $task->task_order,
                    "task_description" => $task->task_description
                ];
            }

            return $this->response->setJsonContent([

                "status" => "success",

                "template" => [
                    "id" => $template->id,
                    "template_name" => $template->template_name,
                    "equipment_type" => $template->equipment_type,
                    "version_year" => $template->version_year
                ],

                "data" => $result
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    // Save maintenance checklist log
    public function saveMaintenanceChecklistAction()
    {
        $this->view->disable();

        try {
            $this->db->begin();
            $data = $this->request->getJsonRawBody();

            $log = new MaintenanceChecklistLogs();
            $log->template_id       = $data->template_id;
            $log->equipment_id      = $data->equipment_id ?? null;
            $log->device_name       = $data->device_name ?? '';
            $log->accountable_person = $data->accountable_person ?? '';
            $log->par_ics           = $data->par_ics ?? '';
            $log->equipment_type    = $data->equipment_type ?? '';
            $log->findings          = $data->findings ?? '';
            $log->recommendation    = $data->recommendation ?? '';
            $log->signature         = $data->signature ?? '';
            $log->approved_by       = $data->approved_by ?? '';
            $log->verified_by       = $data->verified_by ?? '';
            $log->noted_by          = $data->noted_by ?? '';
            $log->created_by        = $data->created_by ?? 0;
            $log->created_at        = date('Y-m-d H:i:s');

            if (!$log->save()) {
                throw new Exception(implode(', ', $log->getMessages()));
            }

            if (!empty($data->tasks)) {
                foreach ($data->tasks as $task) {
                    $taskLog = new MaintenanceChecklistLogTasks();
                    $taskLog->checklist_log_id  = $log->id;
                    $taskLog->checklist_task_id = $task->id;
                    $taskLog->is_done           = $task->done ? 1 : 0;
                    if (!$taskLog->save()) {
                        throw new Exception(implode(', ', $taskLog->getMessages()));
                    }
                }
            }

            $this->db->commit();
            return $this->response->setJsonContent([
                "status"  => "success",
                "message" => "Checklist saved successfully"
            ]);

        } catch (Exception $e) {
            $this->db->rollback();
            return $this->response->setJsonContent([
                "status"  => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    // Get maintenance checklist log
    public function getSavedChecklistAction($equipmentId)
    {
        $this->view->disable();

        try {

            $log = MaintenanceChecklistLogs::findFirst([
                "conditions" => "
                    equipment_id = :equipment_id:
                ",
                "bind" => [
                    "equipment_id" => $equipmentId
                ],
                "order" => "id DESC"
            ]);

            if (!$log) {
                return $this->response->setJsonContent([
                    "status" => "empty",
                    "message" => "No saved checklist found"
                ]);
            }

            $template =
                MaintenanceChecklistTemplates::findFirst(
                    $log->template_id
                );

            $taskLogs =
                MaintenanceChecklistLogTasks::find([
                    "conditions" => "
                        checklist_log_id = :checklist_log_id:
                    ",
                    "bind" => [
                        "checklist_log_id" => $log->id
                    ]
                ]);

            $tasks = [];

            foreach ($taskLogs as $taskLog) {

                $task =
                    MaintenanceChecklistTasks::findFirst(
                        $taskLog->checklist_task_id
                    );

                if (!$task) {
                    continue;
                }

                $tasks[] = [
                    "id" => $task->id,
                    "task_description" =>
                        $task->task_description,
                    "done" =>
                        (bool) $taskLog->is_done
                ];
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "data" => [
                    "id" => $log->id,
                    "equipment_id" => $log->equipment_id,
                    "device_name" => $log->device_name,
                    "accountable_person" => $log->accountable_person,
                    "par_ics" => $log->par_ics,
                    "equipment_type" => $log->equipment_type,
                    "template_id" => $log->template_id,
                    "template_name" => $template? $template->template_name: '',
                    "version_year" => $template? $template->version_year: '',
                    "findings" => $log->findings,
                    "recommendation" => $log->recommendation,
                    "tasks" => $tasks,
                    "signature" => $log->signature,
                    "approved_by" => $log->approved_by,
                    "verified_by" => $log->verified_by,
                    "noted_by" => $log->noted_by,
                    "approved_at" => $log->approved_at,
                    "verified_at" => $log->verified_at,
                    "noted_at" => $log->noted_at,
                ]
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    ////////////////////////
    /// Maintenance Logs 
    ////////////////////////   
    // Get Maintenance Logs 
    // currently only data from itrm_service_report is being fetched
    public function getMaintenanceLogsAction()
    {
        $this->view->disable();

        try {
            $hasFilters =
                $this->request->getQuery('dateFrom') ||
                $this->request->getQuery('dateTo') ||
                $this->request->getQuery('search') ||
                $this->request->getQuery('staff');

            if (!$hasFilters) {
                return $this->response->setJsonContent([
                    "status" => "success",
                    "data" => [],
                    "pagination" => ["currentPage" => 1, "totalPages" => 0, "totalRecords" => 0]
                ]);
            }

            $page   = (int) $this->request->getQuery('page', 'int', 1);
            $limit  = (int) $this->request->getQuery('limit', 'int', 10);
            $offset = ($page - 1) * $limit;
            $search     = $this->request->getQuery('search', 'string', '');
            $dateFrom   = $this->request->getQuery('dateFrom', 'string', '');
            $dateTo     = $this->request->getQuery('dateTo', 'string', '');
            $staffParam = $this->request->getQuery('staff', 'string', '');

            // ─── 1. Service Reports ───
            $srConditions = "request_status = 'Released'";
            $srBind = [];

            if ($search) {
                $srConditions .= " AND (control_no LIKE :search: OR issue_request LIKE :search: OR action_taken LIKE :search: OR remarks LIKE :search:)";
                $srBind['search'] = "%$search%";
            }
            if ($dateFrom) { $srConditions .= " AND date_of_request >= :dateFrom:"; $srBind['dateFrom'] = $dateFrom; }
            if ($dateTo)   { $srConditions .= " AND date_of_request <= :dateTo:";   $srBind['dateTo']   = $dateTo; }
            if ($staffParam) { $srConditions .= " AND personnel_id = :staff:"; $srBind['staff'] = $staffParam; }

            $serviceTypeMap = [
                1 => 'Basic Troubleshooting', 2 => 'Installation of OS',
                3 => 'Installation of Applications', 4 => 'Data Backup',
                5 => 'Data Retrieval', 6 => 'Printer', 7 => 'Hardware Repair',
                8 => 'Network Repair', 9 => 'Network', 10 => 'Virus',
                11 => 'Inspection', 12 => 'Registration to Biometrics'
            ];

            $srRecords = ItrmServiceReport::find([
                "conditions" => $srConditions,
                "bind"       => $srBind,
                "order"      => "date_of_request DESC"
            ]);

            $result = [];

            foreach ($srRecords as $record) {
                $personnel = Personnels::findFirst([
                    "conditions" => "personnel_id = :id:",
                    "bind" => ["id" => $record->personnel_id]
                ]);

                $services          = json_decode($record->services ?? '[]', true);
                $serviceLevels     = json_decode($record->service_level_id ?? '{}', true);
                $serviceQuantities = json_decode($record->service_quantity_id ?? '{}', true);
                $serviceNames      = [];

                if (is_array($services)) {
                    foreach ($services as $serviceId) {
                        if (!isset($serviceTypeMap[$serviceId])) continue;
                        $formatted = $serviceTypeMap[$serviceId];
                        $qty   = $serviceQuantities[$serviceId] ?? '';
                        $level = $serviceLevels[$serviceId] ?? '';
                        if ($qty !== '')   $formatted .= " ({$qty})";
                        if ($level !== '') $formatted .= " {$level}";
                        $serviceNames[] = $formatted;
                    }
                }

                $result[] = [
                    "id"               => 'sr_' . $record->id,
                    "date"             => $record->date_of_request,
                    "refNumber"        => $record->control_no,
                    "issue"            => $record->issue_request,
                    "assignedStaff"    => $personnel ? $personnel->personnel_name : 'Unassigned',
                    "actionTaken"      => $record->action_taken ?? '',
                    "remarks"          => $record->remarks ?? '',
                    "servicesRendered" => implode(", ", $serviceNames),
                    "source"           => "service_report"
                ];
            }

            // ─── 2. Maintenance Checklist Logs ───
            // Skip if staff filter is active (checklist logs have no staff FK)
            if (!$staffParam) {
                $clConditions = "1=1";
                $clBind = [];

                if ($search) {
                    $clConditions .= " AND (device_name LIKE :search: OR accountable_person LIKE :search: OR findings LIKE :search: OR approved_by LIKE :search:)";
                    $clBind['search'] = "%$search%";
                }
                if ($dateFrom) { $clConditions .= " AND created_at >= :dateFrom:"; $clBind['dateFrom'] = $dateFrom; }
                if ($dateTo)   { $clConditions .= " AND created_at <= :dateTo:";   $clBind['dateTo']   = $dateTo . ' 23:59:59'; }

                $clRecords = MaintenanceChecklistLogs::find([
                    "conditions" => $clConditions,
                    "bind"       => $clBind,
                    "order"      => "created_at DESC"
                ]);

                foreach ($clRecords as $cl) {
                    $result[] = [
                        "id"               => 'cl_' . $cl->id,
                        "date"             => $cl->created_at,
                        "refNumber"        => '',
                        "issue"            => '',
                        "assignedStaff"    => $cl->approved_by ?? '',
                        "actionTaken"      => 'Performed Checklist',
                        "remarks"          => $cl->findings ?? '',
                        "servicesRendered" => '',
                        "source"           => "checklist_log"
                    ];
                }
            }

            // ─── 3. Sort merged results by date DESC ───
            usort($result, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });

            // ─── 4. Paginate ───
            $total        = count($result);
            $paged        = array_slice($result, $offset, $limit);

            return $this->response->setJsonContent([
                "status" => "success",
                "data"   => $paged,
                "pagination" => [
                    "currentPage"  => $page,
                    "totalPages"   => $total > 0 ? (int) ceil($total / $limit) : 0,
                    "totalRecords" => $total
                ]
            ]);

        } catch (Exception $e) {
            return $this->response->setJsonContent([
                "status"  => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    public function getMaintenanceLogDetailAction()
    {
        $this->view->disable();

        try {
            $source = $this->request->getQuery('source', 'string', '');
            $id     = (int) $this->request->getQuery('id', 'int', 0);

            if (!$source || !$id) {
                return $this->response->setJsonContent(["status" => "error", "message" => "Missing source or id"]);
            }

            // ─── E-Ticket (itrm_service_report) ───
            if ($source === 'service_report') {

                $record = ItrmServiceReport::findFirst($id);
                if (!$record) {
                    return $this->response->setJsonContent(["status" => "error", "message" => "Record not found"]);
                }

                $personnel = Personnels::findFirst([
                    "conditions" => "personnel_id = :id:",
                    "bind" => ["id" => $record->personnel_id]
                ]);

                $serviceTypeMap = [
                    1 => ['name' => 'Basic Troubleshooting',         'levels' => []],
                    2 => ['name' => 'Installation of OS',             'levels' => []],
                    3 => ['name' => 'Installation of Applications',   'levels' => []],
                    4 => ['name' => 'Data Backup',                    'levels' => ['LC','HC']],
                    5 => ['name' => 'Data Retrieval',                 'levels' => ['LC','HC']],
                    6 => ['name' => 'Printer',                        'levels' => ['Moderate','Complex']],
                    7 => ['name' => 'Hardware Repair',                'levels' => ['Simple','Moderate','Complex']],
                    8 => ['name' => 'Network Repair',                 'levels' => ['Moderate','Complex']],
                    9 => ['name' => 'Network',                        'levels' => ['Wired','Wireless','Cabling']],
                    10 => ['name' => 'Virus',                         'levels' => ['Simple','Moderate']],
                    11 => ['name' => 'Inspection',                    'levels' => ['Delivery','Disposal']],
                    12 => ['name' => 'Registration to Biometrics',    'levels' => []]
                ];

                $services          = json_decode($record->services ?? '[]', true);
                $serviceLevels     = json_decode($record->service_level_id ?? '{}', true);
                $serviceQuantities = json_decode($record->service_quantity_id ?? '{}', true);
                $parsedServices    = [];

                if (is_array($services)) {
                    foreach ($services as $sid) {
                        if (!isset($serviceTypeMap[$sid])) continue;
                        $parsedServices[] = [
                            "id"       => $sid,
                            "name"     => $serviceTypeMap[$sid]['name'],
                            "quantity" => $serviceQuantities[$sid] ?? '',
                            "level"    => $serviceLevels[$sid] ?? ''
                        ];
                    }
                }

                return $this->response->setJsonContent([
                    "status" => "success",
                    "source" => "service_report",
                    "data"   => [
                        "control_no"      => $record->control_no,
                        "date_started"    => $record->date_started,
                        "property_no"     => $record->property_no,
                        "personnel_id"    => $record->personnel_id,
                        "personnel_name"  => $personnel ? $personnel->personnel_name : 'Unassigned',
                        "services"        => $parsedServices,
                        "action_taken"    => $record->action_taken ?? '',
                        "remarks"         => $record->remarks ?? '',
                        "process_time"    => $record->process_time ?? ''
                    ]
                ]);
            }

            // ─── Preventive Maintenance (maintenance_checklist_logs) ───
            if ($source === 'checklist_log') {

                $log = MaintenanceChecklistLogs::findFirst($id);
                // Get checklist tasks with their done status
                $taskLogs = MaintenanceChecklistLogTasks::find([
                    "conditions" => "checklist_log_id = :log_id:",
                    "bind" => ["log_id" => $log->id]
                ]);

                $tasks = [];
                foreach ($taskLogs as $taskLog) {
                    $task = MaintenanceChecklistTasks::findFirst($taskLog->checklist_task_id);
                    if (!$task) continue;
                    $tasks[] = [
                        "id"          => $task->id,
                        "task_order"  => $task->task_order,
                        "task"        => $task->task_description,
                        "done"        => (bool) $taskLog->is_done
                    ];
                }

                if (!$log) {
                    return $this->response->setJsonContent(["status" => "error", "message" => "Record not found"]);
                }

                $eq = $log->equipment_id ? ItEquipment::findFirst((int)$log->equipment_id) : null;

                $officeMap   = [];
                $divisionMap = [];

                foreach (Office::find() as $o)    { $officeMap[$o->office_id]       = $o->office_value; }
                foreach (Divisions::find() as $d) { $divisionMap[$d->division_id]   = $d->division_name; }

                $equipmentTypes = [];
                if ($eq) {
                    foreach (DeviceEquipmentTypes::find(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) as $t) {
                        $equipmentTypes[] = $t->equipment_type;
                    }
                }

                // Hardware
                $hw = $eq ? DeviceHardware::findFirst(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : null;
                $hardware = null;
                if ($hw) {
                    $hardware = [
                        "motherboard"    => ["brand" => $hw->motherboard_brand,    "serial" => $hw->motherboard_serial],
                        "processor"      => ["brand" => $hw->processor_brand,      "serial" => $hw->processor_serial],
                        "monitor"        => ["brand" => $hw->monitor_brand,        "serial" => $hw->monitor_serial],
                        "gpu"            => ["brand" => $hw->gpu_brand,            "serial" => $hw->gpu_serial],
                        "ups"            => ["brand" => $hw->ups_brand,            "serial" => $hw->ups_serial],
                        "printer"        => ["brand" => $hw->printer_brand,        "serial" => $hw->printer_serial],
                        "dataCabinet"    => ["brand" => $hw->data_cabinet_brand,   "serial" => $hw->data_cabinet_serial],
                        "networkSwitch"  => ["brand" => $hw->network_switch_brand, "serial" => $hw->network_switch_serial]
                    ];
                }

                // Software
                $sw = $eq ? DeviceSoftware::findFirst(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : null;
                $software = null;
                if ($sw) {
                    $software = [
                        "computer_name"            => $sw->computer_name,
                        "operating_system"         => $sw->operating_system,
                        "os_license_key"           => $sw->os_license_key,
                        "productivity_suite"       => $sw->productivity_suite,
                        "productivity_license_key" => $sw->productivity_license_key,
                        "endpoint_protection"      => $sw->endpoint_protection,
                        "bitlocker_key"            => $sw->bitlocker_key,
                        "device_name"              => $sw->device_name
                    ];
                }

                // Memory
                $memoryRecords = $eq ? DeviceMemory::find(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : [];
                $memory = ["RAM" => [], "HDD" => [], "SSD" => []];
                foreach ($memoryRecords as $m) {
                    $memory[$m->type][] = ["brand" => $m->brand, "serial" => $m->serial];
                }

                // Network
                $net = $eq ? DeviceNetwork::findFirst(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : null;
                $network = null;
                if ($net) {
                    $network = [
                        "ip_address"          => $net->ip_address,
                        "mac_address"         => $net->mac_address,
                        "internet_access"     => $net->internet_access,
                        "connection_type"     => $net->connection_type,
                        "internet_permission" => $net->internet_permission
                    ];
                }

                return $this->response->setJsonContent([
                    "status" => "success",
                    "source" => "checklist_log",
                    "data"   => [
                        "accountable_person" => $log->accountable_person ?? ($eq ? $eq->accountable_person : ''),
                        "end_user"           => $eq ? $eq->end_user : '',
                        "par_ics"            => $log->par_ics ?? ($eq ? $eq->par_ics : ''),
                        "equipment_type"     => $equipmentTypes,
                        "designation"        => $eq ? $eq->designation : '',
                        "division"           => $eq ? ($divisionMap[$eq->division_id] ?? '') : '',
                        "department"         => $eq ? ($officeMap[$eq->office_id] ?? '') : '',
                        "findings"           => $log->findings ?? '',
                        "recommendation"     => $log->recommendation ?? '',
                        "approved_by"        => $log->approved_by ?? '',
                        "verified_by"        => $log->verified_by ?? '',
                        "noted_by"           => $log->noted_by ?? '',
                        "created_at"         => $log->created_at,
                        "hardware"           => $hardware,
                        "software"           => $software,
                        "memory"             => $memory,
                        "network"            => $network,
                        "tasks"     => $tasks,
                        "signature" => $log->signature ?? ''
                    ]
                ]);
            }

            return $this->response->setJsonContent(["status" => "error", "message" => "Unknown source"]);

        } catch (Exception $e) {
            return $this->response->setJsonContent(["status" => "error", "message" => $e->getMessage()]);
        }
    }
public function printMaintenanceChecklistAction($id)
{
    $this->view->disable();
    require_once(APP_PATH . '/library/tcpdf/tcpdf.php');

    $log = MaintenanceChecklistLogs::findFirst((int)$id);
    if (!$log) { echo "Record not found."; exit; }

    $eq       = $log->equipment_id ? ItEquipment::findFirst((int)$log->equipment_id) : null;
    $template = $log->template_id  ? MaintenanceChecklistTemplates::findFirst((int)$log->template_id) : null;

    $officeMap = []; $divisionMap = [];
    foreach (Office::find()    as $o) { $officeMap[$o->office_id]     = $o->office_value; }
    foreach (Divisions::find() as $d) { $divisionMap[$d->division_id] = $d->division_name; }

    $equipmentTypes = [];
    if ($eq) {
        foreach (DeviceEquipmentTypes::find(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) as $t) {
            $equipmentTypes[] = $t->equipment_type;
        }
    }
    $eqTypeStr = implode(', ', $equipmentTypes);

    // Determine if this is a computer/laptop or peripheral
    $isComputer = empty($equipmentTypes) || count(array_filter($equipmentTypes, function($t) {
        return in_array(strtolower($t), ['computer', 'laptop', 'desktop']);
    })) > 0;

    $hw  = $eq ? DeviceHardware::findFirst(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : null;
    $sw  = $eq ? DeviceSoftware::findFirst(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : null;
    $net = $eq ? DeviceNetwork::findFirst(["conditions"  => "device_id = ?0", "bind" => [$eq->id]]) : null;

    $memAll = $eq ? DeviceMemory::find(["conditions" => "device_id = ?0", "bind" => [$eq->id]]) : [];
    $ram = []; $hdd = []; $ssd = [];
    foreach ($memAll as $m) {
        if ($m->type === 'RAM') $ram[] = $m;
        elseif ($m->type === 'HDD') $hdd[] = $m;
        elseif ($m->type === 'SSD') $ssd[] = $m;
    }

    // Tasks
    $taskLogs = MaintenanceChecklistLogTasks::find([
        "conditions" => "checklist_log_id = :lid:",
        "bind" => ["lid" => $log->id]
    ]);
    $tasks = [];
    foreach ($taskLogs as $tl) {
        $task = MaintenanceChecklistTasks::findFirst($tl->checklist_task_id);
        if ($task) {
            $tasks[] = [
                "order" => (int)$task->task_order,
                "desc"  => $task->task_description,
                "done"  => (bool)$tl->is_done
            ];
        }
    }
    usort($tasks, function($a, $b) { return $a['order'] - $b['order']; });

    // ─── TCPDF Setup ───
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('ETS PMS');
    $pdf->SetTitle('Preventive Maintenance Checklist');
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(10, 10, 10);
    $pdf->SetAutoPageBreak(true, 10);
    $pdf->AddPage();

    $W = 190; $h = 6;
    $versionYear   = $template ? $template->version_year : date('Y');
    $refNo         = $log->id;
    $datePerformed = date('F d, Y', strtotime($log->created_at));

    // ─── HEADER ───
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->Cell($W, 7, $versionYear . ' PREVENTIVE MAINTENANCE CHECKLIST FOR COMPUTERS', 0, 1, 'C');
    $pdf->SetFont('helvetica', '', 9);
    $pdf->Cell($W/2, 5, 'Reference No: ' . $refNo, 0, 0, 'L');
    $pdf->Cell($W/2, 5, 'Date: ' . $datePerformed, 0, 1, 'R');
    $pdf->Ln(1);

    // ─── INFO TABLE ───
    $col1 = 95; $col2 = 95;
    $pdf->SetFillColor(222, 234, 246);

    $infoRows = [
        [['Accountable Person:', $log->accountable_person ?: ($eq ? $eq->accountable_person : '—')],
         ['Department:',         $eq ? ($officeMap[$eq->office_id] ?? '—') : '—']],
        [['Designation:',        $eq ? $eq->designation : '—'],
         ['Division:',           $eq ? ($divisionMap[$eq->division_id] ?? '—') : '—']],
    ];
    foreach ($infoRows as $row) {
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->Cell($col1, $h, '  ' . $row[0][0], 'LT', 0, 'L', true);
        $pdf->Cell($col2, $h, '  ' . $row[1][0], 'LT', 1, 'L', true);
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($col1, $h, '  ' . $row[0][1], 'LB', 0, 'L');
        $pdf->Cell($col2, $h, '  ' . $row[1][1], 'LB', 1, 'L');
    }

    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($W, $h, '  Assigned User:', 'LT', 1, 'L', true);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->Cell($W, $h, '  ' . ($eq ? $eq->end_user : '—'), 'LB', 1, 'L');

    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($col1, $h, '  Equipment Type:', 'LT', 0, 'L', true);
    $pdf->Cell($col2, $h, '  Location:', 'LT', 1, 'L', true);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->Cell($col1, $h, '  ' . ($eqTypeStr ?: '—'), 'LB', 0, 'L');
    $pdf->Cell($col2, $h, '  ' . ($eq ? ($officeMap[$eq->office_id] ?? '—') : '—'), 'LB', 1, 'L');

    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($col1, $h, '  Property Number (ICS/PAR):', 'LTR', 0, 'L', true);
    $pdf->Cell($col2, $h, '  Status:', 'LTR', 1, 'L', true);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->Cell($col1, $h, '  ' . ($log->par_ics ?: ($eq ? $eq->par_ics : '—')), 'LBR', 0, 'L');
    $pdf->Cell($col2, $h, '  ' . ($eq ? $eq->status : '—'), 'LBR', 1, 'L');

    $pdf->Ln(2);

    // ─── HARDWARE INFORMATION ───
    // Only show if any hardware data exists
    $hasHW = $hw && (
        $hw->motherboard_brand || $hw->processor_brand || $hw->monitor_brand ||
        $hw->gpu_brand || $hw->ups_brand || $hw->printer_brand ||
        $hw->data_cabinet_brand || $hw->network_switch_brand ||
        count($ram) || count($hdd) || count($ssd)
    );

    if ($hasHW) {
        $col_hw = 70; $col_brand = 70; $col_serial = 50;
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetFillColor(222, 234, 246);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell($col_hw,    $h, 'HARDWARE INFORMATION',  1, 0, 'C', true);
        $pdf->Cell($col_brand, $h, 'Brand / Specification', 1, 0, 'C', true);
        $pdf->Cell($col_serial,$h, 'Serial Number',         1, 1, 'C', true);
        $pdf->SetTextColor(0, 0, 0);

        // Build rows — only include rows that have data
        $hwRows = [];
        if ($hw->motherboard_brand || $hw->motherboard_serial)
            $hwRows[] = ['Motherboard', $hw->motherboard_brand ?? '', $hw->motherboard_serial ?? ''];
        if ($hw->processor_brand || $hw->processor_serial)
            $hwRows[] = ['Processor', $hw->processor_brand ?? '', $hw->processor_serial ?? ''];

        // RAM
        foreach ($ram as $i => $m) {
            $hwRows[] = [($i === 0 ? 'Memory' : ''), 'Slot #' . ($i+1) . '  ' . $m->brand, $m->serial ?? ''];
        }
        // HDD
        foreach ($hdd as $i => $m) {
            $hwRows[] = [($i === 0 ? 'Storage' : ''), 'HDD  ' . $m->brand, $m->serial ?? ''];
        }
        // SSD
        foreach ($ssd as $i => $m) {
            $hwRows[] = [$i === 0 && empty($hdd) ? 'Storage' : '', 'SSD  ' . $m->brand, $m->serial ?? ''];
        }
        if ($hw->monitor_brand || $hw->monitor_serial)
            $hwRows[] = ['Display', 'Monitor  ' . ($hw->monitor_brand ?? ''), $hw->monitor_serial ?? ''];
        if ($hw->gpu_brand || $hw->gpu_serial)
            $hwRows[] = ['', 'Graphics Card  ' . ($hw->gpu_brand ?? ''), $hw->gpu_serial ?? ''];
        if ($hw->ups_brand || $hw->ups_serial)
            $hwRows[] = ['UPS', $hw->ups_brand ?? '', $hw->ups_serial ?? ''];
        if ($hw->printer_brand || $hw->printer_serial)
            $hwRows[] = ['Printer', $hw->printer_brand ?? '', $hw->printer_serial ?? ''];
        if ($hw->network_switch_brand || $hw->network_switch_serial)
            $hwRows[] = ['Network Switch', $hw->network_switch_brand ?? '', $hw->network_switch_serial ?? ''];
        if ($hw->data_cabinet_brand || $hw->data_cabinet_serial)
            $hwRows[] = ['Data Cabinet', $hw->data_cabinet_brand ?? '', $hw->data_cabinet_serial ?? ''];

        foreach ($hwRows as $row) {
            $pdf->SetFont('helvetica', $row[0] !== '' ? 'B' : '', 8);
            $pdf->Cell($col_hw,    $h, '  ' . $row[0], 1, 0, 'L');
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell($col_brand, $h, '  ' . $row[1], 1, 0, 'L');
            $pdf->Cell($col_serial,$h, '  ' . $row[2], 1, 1, 'L');
        }
        $pdf->Ln(2);
    }

    // ─── SOFTWARE INFORMATION ───
    $hasSW = $sw && ($sw->computer_name || $sw->operating_system || $sw->productivity_suite);
    if ($hasSW) {
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetFillColor(222, 234, 246);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell($W, $h, 'SOFTWARE INFORMATION', 1, 1, 'C', true);
        $pdf->SetTextColor(0, 0, 0);

        $swCol = [55, 40, 55, 40];
        $swRows = [];
        if ($sw->computer_name || $sw->os_license_key)
            $swRows[] = ['Computer Name:', $sw->computer_name ?? '', 'License Key:', $sw->os_license_key ?? ''];
        if ($sw->productivity_suite || $sw->productivity_license_key)
            $swRows[] = ['Productivity Suite:', $sw->productivity_suite ?? '', 'License Key:', $sw->productivity_license_key ?? ''];
        if ($sw->operating_system || $sw->endpoint_protection)
            $swRows[] = ['Operating System:', $sw->operating_system ?? '', 'Endpoint Protection:', $sw->endpoint_protection ?? ''];
        if ($sw->bitlocker_key)
            $swRows[] = ['BitLocker Key:', $sw->bitlocker_key ?? '', '', ''];

        foreach ($swRows as $row) {
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->Cell($swCol[0], $h, '  ' . $row[0], 1, 0, 'L');
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell($swCol[1], $h, '  ' . $row[1], 1, 0, 'L');
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->Cell($swCol[2], $h, '  ' . $row[2], 1, 0, 'L');
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell($swCol[3], $h, '  ' . $row[3], 1, 1, 'L');
        }
        $pdf->Ln(2);
    }

    // ─── NETWORK ───
    $hasNet = $net && ($net->ip_address || $net->mac_address);
    if ($hasNet) {
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetFillColor(222, 234, 246);
        $pdf->SetTextColor(0, 0,0 );
        $pdf->Cell($W, $h, 'NETWORK', 1, 1, 'C', true);
        $pdf->SetTextColor(0, 0, 0);

        $internetAccess = strtolower($net->internet_access ?? '');
        $connType       = strtolower($net->connection_type  ?? '');
        $hasInternet    = in_array($internetAccess, ['yes', 'with internet', '1', 'true']);
        $isWired        = in_array($connType,       ['wired', 'lan']);
        $isWireless     = in_array($connType,       ['wireless', 'wifi', 'wi-fi']);

        $netCol = [32, 53, 45, 30, 30];
        // Row 1: IP + With Internet + Wired
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->Cell($netCol[0], $h, '  IP Address:', 1, 0, 'L');
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($netCol[1], $h, '  ' . ($net->ip_address ?? ''), 1, 0, 'L');
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($netCol[2], $h, ($hasInternet  ? '  [x] ' : '  [ ] ') . 'With Internet',    1, 0, 'C');
        $pdf->Cell($netCol[3], $h, ($isWired      ? '  [x] ' : '  [ ] ') . 'Wired',            1, 0, 'C');
        $pdf->Cell($netCol[4], $h, '', 1, 1, 'L');

        // Row 2: MAC + Without Internet + Wireless
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->Cell($netCol[0], $h, '  MAC Address:', 1, 0, 'L');
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($netCol[1], $h, '  ' . ($net->mac_address ?? ''), 1, 0, 'L');
        $pdf->Cell($netCol[2], $h, (!$hasInternet ? '  [x] ' : '  [ ] ') . 'Without Internet', 1, 0, 'C');
        $pdf->Cell($netCol[3], $h, ($isWireless   ? '  [x] ' : '  [ ] ') . 'Wireless',         1, 0, 'C');
        $pdf->Cell($netCol[4], $h, '', 1, 1, 'L');
        $pdf->Ln(2);
    }

    // ─── MAINTENANCE CHECKLIST ───
    if (!empty($tasks)) {
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetFillColor(222, 234, 246);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell($W, $h, 'MAINTENANCE CHECKLIST', 1, 1, 'C', true);
        $pdf->SetTextColor(0, 0, 0);

        // Header row — 3 columns only (no per-task findings)
        $cNo = 10; $cCheck = 20; $cTask = $W - $cNo - $cCheck;
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->Cell($cNo,   $h, 'No.',      1, 0, 'C');
        $pdf->Cell($cTask, $h, 'Task',     1, 0, 'C');
        $pdf->Cell($cCheck,$h, 'Done',     1, 1, 'C');

        $pdf->SetFont('helvetica', '', 8);
        foreach ($tasks as $t) {
            $taskH = max($h, $pdf->getStringHeight($cTask - 4, $t['desc']));
            $xB = $pdf->GetX(); $yB = $pdf->GetY();

            $pdf->MultiCell($cNo,   $taskH, $t['order'],                   1, 'C', false, 0);
            $pdf->MultiCell($cTask, $taskH, '  ' . $t['desc'],             1, 'L', false, 0);
            // Use ASCII [x] / [ ] — no unicode issues
            $pdf->MultiCell($cCheck,$taskH, $t['done'] ? '  [x]' : '  [ ]', 1, 'C', false, 1);
        }
        $pdf->Ln(2);
    }

    // ─── FINDINGS / REMARKS (single merged cell for all tasks) ───
    $findings = $log->findings ?: '';
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($W, $h, 'Findings / Remarks:', 1, 1, 'L');
    $pdf->SetFont('helvetica', '', 8);
    $pdf->MultiCell($W, 18, '  ' . $findings, 1, 'L', false, 1);
    $pdf->Ln(2);

    // ─── RECOMMENDATION ───
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($W, $h, 'Recommendation:', 1, 1, 'L');
    $pdf->SetFont('helvetica', '', 8);
    $pdf->MultiCell($W, 14, '  ' . ($log->recommendation ?: ''), 1, 'L', false, 1);
    $pdf->Ln(2);

    // ─── SIGNATURE BLOCK ───
    // Layout (3 columns, 2 rows):
    //  Row 1: [Acknowledgement text] | [Technical Staff (label+sig)] | [Confirmed by (label+sig)]
    //  Row 2: [empty]                | [Prepared by (label+sig)]     | [Noted by (label+sig)]
    //
    $sCol1 = 50; $sCol2 = 70; $sCol3 = 70;
    $sigH  = 20;  // inner signature space height
    $labelH = 5;
    $nameH  = 5;
    $rowH   = $labelH + $sigH + $nameH; // total row height

    $startX = $pdf->GetX();
    $startY = $pdf->GetY();

    // ── Row 1 ──────────────────────────────────────────────────────────────────

    // Col 1: Acknowledgement text (spans row 1 only, same rowH)
    $ackText = "I hereby acknowledge that this IT equipment has undergone Annual Preventive Maintenance and is currently working properly.";
    $pdf->SetFont('helvetica', '', 7.5);
    $pdf->MultiCell($sCol1, $rowH, $ackText, 1, 'C', false, 0);

    // Col 2: Technical Staff
    $x2 = $startX + $sCol1; $y1 = $startY;
    $pdf->SetXY($x2, $y1);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($sCol2, $labelH, 'Technical Staff:', 'LTR', 1, 'C');

    // Embed signature image if present
    if (!empty($log->signature)) {
        $sigData = $log->signature;
        if (strpos($sigData, 'base64,') !== false) {
            $sigData = substr($sigData, strpos($sigData, 'base64,') + 7);
        }
        $sigFile = tempnam(sys_get_temp_dir(), 'sig_') . '.png';
        file_put_contents($sigFile, base64_decode($sigData));
        $pdf->Image($sigFile, $x2 + 5, $y1 + $labelH + 2, $sCol2 - 10, $sigH - 4, 'PNG');
        @unlink($sigFile);
    }
    $pdf->SetXY($x2, $y1 + $labelH);
    $pdf->Cell($sCol2, $sigH, '', 'LR', 1, 'C');
    $pdf->SetXY($x2, $y1 + $labelH + $sigH);
    $pdf->Cell($sCol2, $nameH, '', 'LBR', 1, 'C');

    // Col 3: Confirmed by
    $x3 = $x2 + $sCol2;
    $pdf->SetXY($x3, $y1);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($sCol3, $labelH, 'Confirmed by:', 'LTR', 1, 'C');
    $pdf->SetXY($x3, $y1 + $labelH);
    $pdf->Cell($sCol3, $sigH, '', 'LR', 1, 'C');
    $pdf->SetXY($x3, $y1 + $labelH + $sigH);
    $pdf->Cell($sCol3, $nameH, '', 'LBR', 1, 'C');

    // ── Row 2 ──────────────────────────────────────────────────────────────────
    $y2 = $startY + $rowH;

    // Col 1: empty cell
    $pdf->SetXY($startX, $y2);
    $pdf->Cell($sCol1, $rowH, '', 1, 0, 'C');

    // Col 2: Prepared by
    $preparedBy = $log->approved_by ?? '';
    $pdf->SetXY($x2, $y2);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($sCol2, $labelH, 'Prepared by:', 'LTR', 1, 'C');
    $pdf->SetXY($x2, $y2 + $labelH);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->Cell($sCol2, $sigH, $preparedBy, 'LR', 1, 'C');
    $pdf->SetXY($x2, $y2 + $labelH + $sigH);
    $pdf->Cell($sCol2, $nameH, '', 'LBR', 1, 'C');

    // Col 3: Noted by
    $notedBy = $log->noted_by ?? '';
    $pdf->SetXY($x3, $y2);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($sCol3, $labelH, 'Noted by:', 'LTR', 1, 'C');
    $pdf->SetXY($x3, $y2 + $labelH);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->Cell($sCol3, $sigH, $notedBy, 'LR', 1, 'C');
    $pdf->SetXY($x3, $y2 + $labelH + $sigH);
    $pdf->Cell($sCol3, $nameH, '', 'LBR', 1, 'C');

    // ─── Output ───
    $pdf->Output('PM_Checklist_' . $log->id . '.pdf', 'I');
    exit;
}
    public function getITStaffAction()
    {
        $this->view->disable();

        try {

            $staffs = Personnels::find([
                "order" => "personnel_name ASC"
            ]);

            $result = [];

            foreach ($staffs as $staff) {
                $result[] = [
                    "id" => $staff->personnel_id,
                    "name" => $staff->personnel_name
                ];
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "data" => $result
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }
    public function getChecklistTemplateOptionsAction()
    {
        $this->view->disable();

        try {
            $templates = MaintenanceChecklistTemplates::find([
                "conditions" => "is_active = 1",
                "order" => "equipment_type ASC, version_year DESC"
            ]);

            $grouped = [];

            foreach ($templates as $template) {
                $equipmentType = $template->equipment_type;

                if (!isset($grouped[$equipmentType])) {
                    $grouped[$equipmentType] = [];
                }

                $grouped[$equipmentType][] = [
                    'id' => $template->id,
                    'version_year' => $template->version_year,
                    'template_name' => $template->template_name
                ];
            }

            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $grouped
            ]);

        } catch (\Exception $e) {

            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);

        }
    }
    // Search IT Equipment for Maintenance Logs
    public function getEquipmentForLogsAction()
    {
        $this->view->disable();

        try {
            $search = $this->request->getQuery('search', 'string', '');

            $conditions = "1=1";
            $bind = [];

            if (!empty($search)) {
                $conditions .= " AND (
                    computer_name LIKE :search:
                    OR end_user LIKE :search:
                    OR accountable_person LIKE :search:
                    OR par_ics LIKE :search:
                )";
                $bind['search'] = "%$search%";
            }

            $equipments = ItEquipment::find([
                "conditions" => $conditions,
                "bind"       => $bind,
                "order"      => "computer_name ASC",
                "limit"      => 20
            ]);

            $offices = Office::find();
            $officeMap = [];
            foreach ($offices as $o) {
                $officeMap[$o->office_id] = $o->office_value;
            }

            $result = [];
            foreach ($equipments as $eq) {
                $types = DeviceEquipmentTypes::find([
                    "conditions" => "device_id = ?0",
                    "bind"       => [$eq->id]
                ]);
                $equipmentTypes = [];
                foreach ($types as $t) {
                    $equipmentTypes[] = $t->equipment_type;
                }

                $result[] = [
                    "id"               => $eq->id,
                    "computerName"     => $eq->computer_name,
                    "endUser"          => $eq->end_user,
                    "accountablePerson"=> $eq->accountable_person,
                    "par"              => $eq->par_ics,
                    "department"       => $officeMap[$eq->office_id] ?? '',
                    "status"           => $eq->status,
                    "equipmentType"    => $equipmentTypes
                ];
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "data"   => $result
            ]);

        } catch (Exception $e) {
            return $this->response->setJsonContent([
                "status"  => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

    ////////////////////////
    /// Checklist Records
    //////////////////////// 
    // Get Checklist Records 
    public function getChecklistTemplatesAction()
    {
        $this->view->disable();

        try {

            $conditions = "is_active = 1";
            $bind = [];

            if ($this->request->getQuery('search')) {

                $search = $this->request->getQuery('search');

                $conditions .= "
                    AND (
                        template_name LIKE :search:
                        OR equipment_type LIKE :search:
                        OR version_year LIKE :search:
                    )
                ";

                $bind["search"] = "%" . $search . "%";
            }

            if ($this->request->getQuery('year')) {

                $conditions .= " AND version_year = :year:";
                $bind["year"] = $this->request->getQuery('year');
            }

            if ($this->request->getQuery('equipmentType')) {

                $conditions .= " AND equipment_type = :equipmentType:";
                $bind["equipmentType"] =
                    $this->request->getQuery('equipmentType');
            }

            $page = (int) $this->request->getQuery('page', 'int', 1);
            $limit = (int) $this->request->getQuery('limit', 'int', 10);

            $offset = ($page - 1) * $limit;

            $totalRecords = MaintenanceChecklistTemplates::count([
                "conditions" => $conditions,
                "bind" => $bind
            ]);

            $templates = MaintenanceChecklistTemplates::find([
                "conditions" => $conditions,
                "bind" => $bind,
                "order" => "created_at DESC",
                "limit" => $limit,
                "offset" => $offset
            ]);

            $result = [];

            foreach ($templates as $t) {

                $result[] = [
                    "id" => $t->id,
                    "template_name" => $t->template_name,
                    "version_year" => (int) $t->version_year,
                    "equipment_type" => $t->equipment_type
                ];
            }

            return $this->response->setJsonContent([

                "status" => "success",

                "data" => $result,

                "pagination" => [
                    "currentPage" => $page,
                    "pageSize" => $limit,
                    "totalRecords" => $totalRecords,
                    "totalPages" => ceil($totalRecords / $limit)
                ]
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => "Failed to fetch checklist templates",
                "error" => $e->getMessage()
            ]);
        }
    }
    // Checklist Filtering for equipment_types and version_year 
    public function getChecklistTemplateFiltersAction()
    {
        $this->view->disable();

        try {

            $templates = MaintenanceChecklistTemplates::find([
                "conditions" => "is_active = 1"
            ]);

            $years = [];
            $equipmentTypes = [];

            foreach ($templates as $t) {

                $years[] = (int) $t->version_year;
                $equipmentTypes[] = $t->equipment_type;
            }

            $years = array_values(array_unique($years));

            $equipmentTypes =
                array_values(array_unique($equipmentTypes));

            rsort($years);

            sort($equipmentTypes);

            return $this->response->setJsonContent([
                "status" => "success",

                "filters" => [
                    "years" => $years,
                    "equipmentTypes" => $equipmentTypes
                ]
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => "Failed to fetch filters",
                "error" => $e->getMessage()
            ]);
        }
    }
    // Get checklist tasks for view dialog 
    public function getChecklistTemplateDetailsAction($id)
    {
        $this->view->disable();

        try {

            $template = MaintenanceChecklistTemplates::findFirst([
                "conditions" => "id = :id:",
                "bind" => [
                    "id" => $id
                ]
            ]);

            if (!$template) {

                return $this->response->setJsonContent([
                    "status" => "error",
                    "message" => "Template not found"
                ]);
            }

            $tasks = MaintenanceChecklistTasks::find([
                "conditions" => "
                    template_id = :template_id:
                    AND is_active = 1
                ",
                "bind" => [
                    "template_id" => $id
                ],
                "order" => "task_order ASC"
            ]);

            $taskData = [];

            foreach ($tasks as $task) {

                $taskData[] = [
                    "id" => $task->id,
                    "task_order" => $task->task_order,
                    "task_description" => $task->task_description
                ];
            }

            return $this->response->setJsonContent([

                "status" => "success",

                "data" => [

                    "id" => $template->id,

                    "template_name" =>
                        $template->template_name,

                    "equipment_type" =>
                        $template->equipment_type,

                    "version_year" =>
                        $template->version_year,

                    "tasks" => $taskData
                ]
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => "Failed to fetch checklist details",
                "error" => $e->getMessage()
            ]);
        }
    }
    public function createChecklistTemplateAction()
    {
        $this->view->disable();

        try {

            $data = $this->request->getJsonRawBody();

            $template = new MaintenanceChecklistTemplates();

            $template->template_name =
                $data->template_name;

            $template->equipment_type =
                $data->equipment_type;

            $template->version_year =
                $data->version_year;

            $template->is_active = 1;

            $template->created_at =
                date('Y-m-d H:i:s');

            if (!$template->save()) {

                return $this->response->setJsonContent([
                    "status" => "error",
                    "message" => "Failed to create template"
                ]);
            }

            foreach ($data->tasks as $index => $task) {

                $t = new MaintenanceChecklistTasks();

                $t->template_id = $template->id;
                $t->task_order = $index + 1;
                $t->task_description = $task->task_description;
                $t->is_active = 1;

                $t->save();
            }

            return $this->response->setJsonContent([
                "status" => "success",
                "message" => "Template created successfully"
            ]);

        } catch (Exception $e) {

            return $this->response->setJsonContent([
                "status" => "error",
                "message" => $e->getMessage()
            ]);
        }
    }

}


