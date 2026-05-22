<?php

declare(strict_types=1);
use Phalcon\Http\Response;
use Phalcon\Filter\FilterFactory;

class UsersController extends \Phalcon\Mvc\Controller
{ 

    /*                */ 
    /*    Dashboard   */
    /*                */
    // For all Dashboard data for the request status cards such as Unaasigned, Unapproved, In-Process, For Release
    public function getApprovalStatsAction()
    {
        $this->view->disable();

        $auth = $this->session->get('auth');
        if (!$auth || !isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Unauthorized access.'
            ]);
        }

        $filter = $this->request->getQuery('filter', 'string', 'all');
        $idNumber = $auth['id'];

        $conditions = [];
        $bind = [];

        if ($filter === 'self') {
            $conditions[] = 'personnel_id = :id:';
            $bind['id'] = $idNumber;
        }

        $whereSelf = function ($extra) use ($conditions) {
            return implode(' AND ', array_merge($conditions, [$extra]));
        };

        $unapproved = ItrmServiceReport::count([
            'conditions' => $whereSelf('approval_status = 0'),
            'bind' => $bind
        ]);

        $unassigned = ItrmServiceReport::count([
            'conditions' => $whereSelf('approval_status = 1 AND personnel_id IS NULL'),
            'bind' => $bind
        ]);

        $inProcess = ItrmServiceReport::count([
            'conditions' => $whereSelf('control_no IS NOT NULL AND control_no != "Pending" AND request_status = "Ongoing"'),
            'bind' => $bind
        ]);

        $forRelease = ItrmServiceReport::count([
            'conditions' => $whereSelf('control_no IS NOT NULL AND control_no != "Pending" AND request_status = "For release"'),
            'bind' => $bind
        ]);

        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => [
                'unapproved' => $unapproved,
                'unassigned' => $unassigned,
                'in_process' => $inProcess,
                'for_release' => $forRelease
            ]
        ]);
    }

    // For all Dashboard data for bottom card monthly tickets 
    public function getMonthlyRequestsAction()
    {
        $this->view->disable();
        $year = date('Y');
        $auth = $this->session->get('auth');
        $filter = $this->request->getQuery('filter', 'string', 'all');
        $personnelId = $auth['id'] ?? null;

        $conditions = "YEAR(date_of_request) = :year:";
        $bind = ['year' => $year];

        if ($filter === 'self' && $personnelId) {
            $conditions .= " AND personnel_id = :personnel_id:";
            $bind['personnel_id'] = $personnelId;
        }

        $ql = "
            SELECT 
                DATE_FORMAT(date_of_request, '%b') AS month,
                COUNT(*) AS count
            FROM ItrmServiceReport
            WHERE $conditions
            GROUP BY MONTH(date_of_request)
            ORDER BY MONTH(date_of_request)
        ";

        $results = $this->modelsManager->executeQuery($ql, $bind);

        $months = ['Jan'=>0,'Feb'=>0,'Mar'=>0,'Apr'=>0,'May'=>0,'Jun'=>0,
                'Jul'=>0,'Aug'=>0,'Sep'=>0,'Oct'=>0,'Nov'=>0,'Dec'=>0];

        foreach ($results as $r) {
            $months[$r->month] = (int)$r->count;
        }

        return $this->response->setJsonContent([
            'status'=>'success',
            'data'=>$months
        ]);
    }

    // For all Dashboard data for bottom card services rendered
    public function getRequestsByTypeAction()
    {
        $this->view->disable();

        $auth = $this->session->get('auth');
        if (!$auth || !isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Unauthorized access.'
            ]);
        }

        $filter = $this->request->getQuery('filter', 'string', 'all');
        $idNumber = $auth['id'];

        $conditions = [];
        $bind = [];

        if ($filter === 'self') {
            $conditions[] = 'personnel_id = :id:';
            $bind['id'] = $idNumber;
        }

        $reports = ItrmServiceReport::find([
            'conditions' => implode(' AND ', $conditions),
            'bind' => $bind
        ]);

        $serviceCounts = [];

        foreach ($reports as $report) {
            if (empty($report->service_quantity_id)) continue;

            $quantity = json_decode($report->service_quantity_id, true);
            $levels = json_decode($report->service_level_id ?? '{}', true);

            foreach ($quantity as $serviceId => $count) {
                $level = $levels[$serviceId] ?? '';
                $label = $this->getServiceLabel($serviceId, $level);

                if (!isset($serviceCounts[$label])) {
                    $serviceCounts[$label] = 0;
                }
                $serviceCounts[$label] += $count;
            }
        }

        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $serviceCounts
        ]);
    }

    public function getTechnicalSupportUsersAction() 
    { 
        $this->view->disable();
        $division = Divisions::findFirst([ 
            'conditions' => 'division_name = :name:',
            'bind' => ['name' => 'IT Repair & Maintenance']
            ]); 
            if (!$division) {
                return $this->response->setJsonContent(['status' => 'success', 'data' => [] ]);
            } 
            $users = Users::find([
                'conditions' => 'division_id = :division_id:', 
                'bind' => ['division_id' => $division->division_id],
                'columns' => 'id_number, name' 
                ]); 
                $result = [];
                foreach ($users as $user) {
                    $result[] = [
                    'id' => $user->id_number,
                    'name' => $user->name ]; 
                    } 
                    return $this->response->setJsonContent([ 'status' => 'success', 'data' => $result ]); 
    }

    private function getServiceLabel($id, $level)
    {
        $labels = [
            1 => 'Basic Troubleshooting',
            2 => 'Installation of OS',
            3 => 'Installation of Applications',
            4 => 'Data Backup',
            5 => 'Data Retrieval',
            6 => 'Printer',
            7 => 'Hardware Repair',
            8 => 'Network Repair',
            9 => 'Network',
            10 => 'Virus',
            11 => 'Inspection',
            12 => 'Registration to Biometrics'
        ];

        $label = $labels[$id] ?? "Unknown Service ($id)";
        return $level ? "$label ($level)" : $label;
    }





    /*                                                                    */ 
    /*    Office Approval | ICT Service Monitoring | Department Audit   */
    /*                                                                    */

    // fetch reports with column accept value of "1" from itrm_service_report to monitor 
    public function fetchAcceptedReportsAction()
    {
        $filter = $this->request->get('filter', 'string', ''); 
        $conditions = "r.accept = 1"; //only accepted reports hehe :3

        //conditions for filter :3
        if ($filter === 'openTicket') {
            $conditions .= " AND r.time_assigned IS NOT NULL AND r.released IS NULL"; 
        } elseif ($filter === 'review') {
            $conditions .= " AND r.request_status = 'Released' AND r.datetime_noted_by IS NULL";
        } elseif ($filter === 'closedTicket') {
            $conditions .= " AND r.released IS NOT NULL AND r.time_assigned IS NOT NULL"; 
        }

        $phql = "
            SELECT 
                r.id,
                r.control_no,
                r.name,
                r.contact_no,
                r.property_no,
                r.issue_request,
                r.date_of_request,
                r.time_assigned,  
                r.date_started,
                o.office_value,
                r.personnel_id,
                r.released,
                r.released_to,
                r.date_released,
                r.approval_datetime,
                r.time_accepted,
                r.action_taken,
                r.remarks,
                r.process_time,
                r.request_status,
                r.datetime_noted_by,
                r.datetime_accomplished,
                r.signature,
                r.dept_head,
                r.services,
                r.service_level_id,
                r.service_quantity_id
            FROM 
                ItrmServiceReport AS r
            JOIN 
                Office AS o
            ON 
                r.office_id = o.office_id
            WHERE 
                $conditions
        ";

        $reports = $this->modelsManager->executeQuery($phql);

        if (count($reports) > 0) {
            $formattedReports = [];
            foreach ($reports as $report) {
                $durationInSeconds = 0;
                $idleTimeSeconds = 0;

                if ($report->date_of_request && $report->time_assigned) {
                    $dateOfRequest = new \DateTime($report->date_of_request);
                    $timeAssigned = new \DateTime($report->time_assigned);
                    $durationInSeconds = $timeAssigned->getTimestamp() - $dateOfRequest->getTimestamp();
                }
                if ($report->approval_datetime && $report->time_accepted) {
                    $approvalDate = new \DateTime($report->approval_datetime);
                    $acceptedDate = new \DateTime($report->time_accepted);
                    $idleTimeSeconds = $this->calculateWorkingTime($approvalDate, $acceptedDate);
                }

                $services = $report->services;
                $serviceLevelId = $report->service_level_id;
                $serviceQuantityId = $report->service_quantity_id;

                // decode json string 
                if (is_string($services)) {
                    $services = json_decode($services, true);
                }
                if (is_string($serviceLevelId)) {
                    $serviceLevelId = json_decode($serviceLevelId, true);
                }
                if (is_string($serviceQuantityId)) {
                    $serviceQuantityId = json_decode($serviceQuantityId, true);
                }

                $formattedReports[] = [
                    'id' => $report->id,
                    'control_no' => $report->control_no,
                    'name' => $report->name,
                    'contact_no' => $report->contact_no,
                    'property_no' => $report->property_no,
                    'issue_request' => $report->issue_request,
                    'date_of_request' => $report->date_of_request,
                    'time_assigned' => $report->time_assigned,
                    'date_started' => $report->date_started,
                    'time_assigned_duration' => $durationInSeconds,
                    'idle_time' => $idleTimeSeconds,
                    'office_value' => $report->office_value,
                    'personnel_id' => $report->personnel_id,
                    'released' => $report->released,
                    'released_to' => $report->released_to,
                    'date_released' => $report->date_released,
                    'approval_datetime' => $report->approval_datetime,
                    'time_accepted' => $report->time_accepted,
                    'action_taken' => $report->action_taken,
                    'remarks' => $report->remarks,
                    'process_time' => $report->process_time,
                    'request_status' => $report->request_status,
                    'datetime_noted_by' => $report->datetime_noted_by,
                    'datetime_accomplished' => $report->datetime_accomplished,
                    'signature' => $report->signature,
                    'dept_head' => $report->dept_head,
                    'services' => $services,
                    'service_level_id' => $serviceLevelId,
                    'service_quantity_id' => $serviceQuantityId
                ];
            }
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $formattedReports
            ]);
        }

        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No accepted reports found.'
        ]);
    }

    // Approval request | Monitor : Personnel Dropdown | Office Request
    public function getPersonnelByDivisionAction()
    {
        $this->view->disable();
    
        $divisionId = $this->session->get('auth')['division_id'];
    
        $personnel = Personnels::find([
            'conditions' => 'division_id = :division_id:',
            'bind'       => ['division_id' => $divisionId],
            'columns'    => 'personnel_id, personnel_name' 
        ]);
    
        if (count($personnel) > 0) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $personnel->toArray()
            ])->send();
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No personnel found for this division.'
        ])->send();
    }

    // Monitoring: Review for collapsible details 
    public function getServiceReportDetailsAction()
    {
        $this->view->disable();
        
        $controlNo = $this->dispatcher->getParam('control_no');
        
        if (!$controlNo) {
            $data = $this->request->getJsonRawBody();
            $controlNo = $data->control_no ?? null;
        }
        if (!$controlNo) {
            $controlNo = $this->request->get('control_no');
        }
        if (!$controlNo) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Control number is required'
            ]);
        }
        
        try {
            $report = ItrmServiceReport::findFirstByControlNo($controlNo);
            if ($report) {
                // join tables office and personnels 
                $office = Office::findFirstByOffice_id($report->office_id);
                $technical_staff = Personnels::findFirstByPersonnel_id($report->personnel_id);
                $result = [
                    'control_no' => $report->control_no,
                    'date_of_request' => $report->date_of_request,
                    'released_to' => $report->released_to,
                    'name' => $report->name,
                    'contact_no' => $report->contact_no,
                    'property_no' => $report->property_no,
                    'office_value' => $office ? $office->office_value : 'N/A',
                    'dept_head' => $report->dept_head,
                    'approval_datetime' => $report->approval_datetime,
                    'issue_request' => $report->issue_request,
                    'action_taken' => $report->action_taken,
                    'remarks' => $report->remarks,
                    'date_started' => $report->date_started,
                    'datetime_accomplished' => $report->datetime_accomplished,
                    'date_released' => $report->date_released,
                    'process_time' => $report->process_time,
                    'services' => json_decode($report->services, true) ?: [],
                    'service_level_id' => json_decode($report->service_level_id, true) ?: [],
                    'service_quantity_id' => json_decode($report->service_quantity_id, true) ?: [],
                    'personnel_name' => $technical_staff ? $technical_staff->personnel_name : 'N/A',
                    'datetime_noted_by' => $report->datetime_noted_by
                ];
                
                return $this->response->setJsonContent([
                    'status' => 'success',
                    'data' => $result
                ]);
            } else {
                return $this->response->setJsonContent([
                    'status' => 'error',
                    'message' => 'No report found with the given control number'
                ]);
            }
        } catch (Exception $e) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }

    // save current datetime to noted by 
    public function approveServiceReportAction()
    {
       $this->view->disable();
        $this->response->setContentType('application/json', 'UTF-8');

        $data = $this->request->getJsonRawBody(true);
        $id = isset($data['id']) ? (int)$data['id'] : $this->request->getPost('id', 'int');

        if (!$id) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Missing report ID.',
            ]);
        }

        $report = ItrmServiceReport::findFirstById($id);
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Report not found.',
            ]);
        }

        $now = new \DateTime('now', new \DateTimeZone('Asia/Manila'));
        $report->datetime_noted_by = $now->format('Y-m-d H:i:s');

        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Report approved successfully.',
                'datetime_noted_by' => $report->datetime_noted_by,
                'id' => $report->id,
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Failed to approve report.',
            ]);
        }
    }

    // update the approval_status on table itrm_service_report to "1"
    public function updateApprovalStatusAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);

        $id = (int) $rawData['id'];
        $approvalStatus = (int) $rawData['approval_status'];

        $report = ItrmServiceReport::findFirstById($id);
        
        if ($report) {
            $report->approval_status = $approvalStatus;
            $report->control_no = "Pending";
            
            // Get the authenticated user's name 
            $auth = $this->session->get('auth'); 
            $userName = isset($auth['name']) ? $auth['name'] : 'Unknown'; 

            // Store the user's name in the dept_head column
            $report->dept_head = $userName;

            if ($approvalStatus === 1) { // Only set approval_datetime if the status is 1 (approved)
                $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
                $report->approval_datetime = $currentDateTime->format('Y-m-d H:i:s');
                $report->control_no = "Pending";
            }
            
            if ($report->save()) {
                return $this->response->setJsonContent(['status' => 'success']);
            }
        }

        return $this->response->setJsonContent(['status' => 'fail', 'message' => 'Update failed.']);
    }

    public function deleteJobRequestAction($requestId)
    {
        $this->view->disable();

        // Fetch the record by its ID
        $itrmReport = ItrmServiceReport::findFirst([
            'conditions' => 'id = :id: AND office_id = :office_id:',
            'bind' => [
                'id' => $requestId,
                'office_id' => $this->session->get('auth')['office_id'],
            ]
        ]);

        // Check if the record exists
        if (!$itrmReport) {
            $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Request not found or unauthorized.'
            ]);
            return $this->response->send();
        }

        if ($itrmReport->delete()) {
            $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Request cancelled and deleted successfully.'
            ]);
        } else {
            $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Failed to delete the request. Please try again later.'
            ]);
        }

        return $this->response->send();
    }  

    // fetch approved reports from table itrm_service_report and display to it supervisor 
    public function getApprovedReportsAction()
    {
        $this->view->disable();
    
        // Fetch records with approval_status = 1 and join the office table to get office_name
        $phql = "
            SELECT 
                r.id,
                r.control_no,
                r.name,
                r.contact_no,
                r.issue_request,
                r.date_of_request,
                r.accept,
                r.approval_datetime,
                r.time_accepted,
                r.time_assigned,
                r.date_released,
                r.released_to,
                o.office_value,
                p.personnel_name,
                r.action_taken,
                r.process_time
            FROM 
                ItrmServiceReport AS r
            JOIN 
                Office AS o ON r.office_id = o.office_id
            LEFT JOIN 
                Personnels AS p ON r.personnel_id = p.personnel_id
            WHERE 
                r.approval_status = :status:
        ";
    
        $approvedReports = $this->modelsManager->executeQuery($phql, [
            'status' => 1
        ]);
    
        if (count($approvedReports) > 0) {
            $formattedReports = [];
            foreach ($approvedReports as $report) {
                $dateOfRequest = $report->date_of_request;
                $timeAccepted = $report->time_accepted;
                $timeAssigned = $report->time_assigned;
            // Format date only
            $formattedDate = $report->date_of_request 
                ? date('M. d, Y', strtotime($report->date_of_request)) 
                : null;
            
            // Format time from date_of_request timestamp
            $formattedTimeOfRequest = $report->date_of_request
                ? date('g:i A', strtotime($report->date_of_request))
                : null;
                $formattedTimeAccepted = $timeAccepted
                    ? (new \DateTime($timeAccepted))->format('g:i A')  
                    : null;
                $formattedTimeAssigned = $timeAssigned
                    ? (new \DateTime($timeAssigned))->format('M d, Y g:i A')
                    : null;
                $idleTimeSeconds = 0;
            if (!empty($report->approval_datetime) && !empty($report->time_accepted)) {
                try {
                    $approvalDate = new \DateTime($report->approval_datetime);
                    $acceptedDate = new \DateTime($report->time_accepted);
                    $idleTimeSeconds = $this->calculateWorkingHours($approvalDate, $acceptedDate);
                } catch (\Exception $e) {
                    error_log("DateTime parse error: " . $e->getMessage());
                    $idleTimeSeconds = 0;
                }
            }
                $formattedReports[] = [
                    'id' => $report->id,
                    'control_no' => $report->control_no,
                    'name' => $report->name,
                    'contact_no' => $report->contact_no,
                    'office_value' => $report->office_value,
                    'issue_request' => $report->issue_request,
                    'date_of_request' => $formattedDate,
                    'time_of_request' => $formattedTimeOfRequest,
                    'accept' => $report->accept,
                    'time_accepted' => $formattedTimeAccepted,
                    'personnel_name' => $report->personnel_name,
                    'time_assigned' => $formattedTimeAssigned,
                    'date_released' => $report->date_released,
                    'released_to' => $report->released_to,
                    'action_taken' => $report->action_taken,
                    'idle_time' => $idleTimeSeconds,
                    'process_time' => $report->process_time,

                ];
            }
    
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $formattedReports
            ]);
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'No approved reports found.'
        ]);
    }

    // Approval Request 
    public function getJobRequestsAction()
    {
        $this->view->disable();
    
        $officeId = $this->session->get('auth')['office_id'];
    
        $filters = $this->request->getQuery('filters', null, []);
        $sort = $this->request->getQuery('sort', null, 'date_of_request'); 
        $order = $this->request->getQuery('order', null, 'ASC'); 
    
        $conditions = 'office_id = :office_id:';
        $bind = ['office_id' => $officeId];
    
        if (!empty($filters['name'])) {
            $conditions .= ' AND name LIKE :name:';
            $bind['name'] = '%' . $filters['name'] . '%';
        }
    
        $itrmReports = ItrmServiceReport::find([
            'conditions' => $conditions,
            'bind' => $bind,
            'order' => $sort . ' ' . $order,
        ]);
    
        $this->response->setJsonContent(['status' => 'success', 'data' => $itrmReports->toArray()]);
        return $this->response->send();
    }

    // Approval Request: Cancel service request
    public function cancelRequestAction($id)
    {
        $this->view->disable();
        $request = ItrmServiceReport::findFirstById($id);

        if (!$request) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Request not found']);
        }

        if ($request->delete()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Request deleted']);
        }

        return $this->response->setJsonContent(['status' => 'error', 'message' => 'Failed to delete request']);
    }

    // Approval Request: function to prevent incorrect data from being assigned and accepted 
    public function assignAndAcceptJobRequestAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody();

        if (!isset($data->id) || !isset($data->personnel_id)) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Missing id or personnel_id.'
            ])->send();
        }

        $reportId = $data->id;
        $personnelId = $data->personnel_id;

        $divisionId = $this->session->get('auth')['division_id'];
        $modelClass = null;

        if ($divisionId == 3) {
            $modelClass = 'ItrmServiceReport';
        }

        if (!$modelClass) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Invalid division for this user.'
            ])->send();
        }

        $report = $modelClass::findFirst([
            'conditions' => 'id = :id: AND accept = 0',
            'bind' => ['id' => $reportId]
        ]);

        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Service report not found or already accepted.'
            ])->send();
        }

        $now = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $report->personnel_id = $personnelId;
        $report->time_assigned = $now->format('Y-m-d H:i:s');
        $report->request_status = 'Ongoing';
        $report->accept = 1;
        $report->time_accepted = $now->format('Y-m-d H:i:s');

        // Always generate control_no if current value is "Pending", empty, or null
        $currentControlNo = trim(strtolower($report->control_no));
        if (empty($report->control_no) || $currentControlNo === 'pending') {
            $currentYear = date('Y');

            $latestReport = $modelClass::findFirst([
                'conditions' => 'control_no LIKE :year:',
                'bind' => ['year' => "ITRM-$currentYear-%"],
                'order' => 'control_no DESC'
            ]);

            $newNumber = '0001';
            if ($latestReport && preg_match('/ITRM-\d{4}-(\d{4})$/', $latestReport->control_no, $matches)) {
                $lastNumber = (int)$matches[1];
                $newNumber = str_pad((string)($lastNumber + 1), 4, '0', STR_PAD_LEFT);
            }

            $report->control_no = "ITRM-$currentYear-$newNumber";
        }

        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Personnel assigned and job request accepted.',
                'data' => $report
            ])->send();
        }

        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'Failed to update job request.'
        ])->send();
    }

    // Approval Request: fetch the personnel id based on the selected dropdown and assign personnel 
    public function assignPersonnelToReportAction()
    {
        $this->view->disable();
    
        $data = $this->request->getJsonRawBody();
    
        if (!isset($data->control_no)) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'control_no is missing in the request.'
            ])->send();
        }
    
        $controlNo = $data->control_no;
        $personnelId = $data->personnel_id;
        error_log("Ref. # received: " . $controlNo);
    
        $divisionId = $this->session->get('auth')['division_id'];
        $modelClass = null;
        if ($divisionId == 3) {
            $modelClass = 'ItrmServiceReport';
        }
        if (!$modelClass) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Invalid division for this user.'
            ])->send();
        }
        $report = $modelClass::findFirst([
            'conditions' => 'control_no = :control_no:',
            'bind' => ['control_no' => $controlNo]
        ]);
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => "Service report with control_no '{$controlNo}' not found in '{$modelClass}'."
            ])->send();
        }
        $report->personnel_id = $personnelId;
        $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
        $report->time_assigned = $currentDateTime->format('Y-m-d H:i:s');
        $report->request_status = 'Ongoing';
    
        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Personnel assigned successfully.'
            ])->send();
        }
    
        return $this->response->setJsonContent([
            'status' => 'fail',
            'message' => 'Failed to assign personnel.'
        ])->send();
    }
    
    public function cancelServiceRequestAction($id)
    {
        $this->view->disable();
        $response = new \Phalcon\Http\Response();

        // Only allow DELETE requests
        if (!$this->request->isDelete()) {
            $response->setStatusCode(405, "Method Not Allowed");
            $response->setJsonContent([
                "status" => "error",
                "message" => "Invalid request method."
            ]);
            return $response;
        }

        try {
            // Find the record in itrm_service_report by ID
            $report = ItrmServiceReport::findFirstById($id);

            if (!$report) {
                $response->setStatusCode(404, "Not Found");
                $response->setJsonContent([
                    "status" => "error",
                    "message" => "Service request not found."
                ]);
                return $response;
            }

            // Attempt to delete the record
            if ($report->delete()) {
                $response->setStatusCode(200, "OK");
                $response->setJsonContent([
                    "status" => "success",
                    "message" => "Service request cancelled and removed successfully."
                ]);
            } else {
                // Delete failed, return error message
                $response->setStatusCode(500, "Internal Server Error");
                $response->setJsonContent([
                    "status" => "error",
                    "message" => "Failed to cancel and remove service request."
                ]);
            }

        } catch (\Exception $e) {
            // Handle unexpected errors
            $response->setStatusCode(500, "Internal Server Error");
            $response->setJsonContent([
                "status" => "error",
                "message" => "An unexpected error occurred: " . $e->getMessage()
            ]);
        }

        return $response;
    }


    /*                  */ 
    /*    Assigned Ticket   */
    /*                  */
    // fetch data job request for current user
    public function fetchReportsForCurrentUserAction()
    {
        $this->view->disable();
    
        $auth = $this->session->get('auth');
        if (!$auth) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'User not authenticated.'
            ])->send();
        }
    
        $id_number = $auth['id'];
        $reports = [];
    
        $itrmReports = ItrmServiceReport::find([
            'conditions' => 'personnel_id = :id_number:',
            'bind'       => ['id_number' => $id_number]
        ]);
        if ($itrmReports) {
            $reports = array_merge($reports, $itrmReports->toArray());
        }
    
        if (!empty($reports)) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $reports
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No service request found, table empty.'
            ])->send();
        }
    }

    // fetch all offices but I only used it on displaying the office_name instead of office_id on view on task page. 
    public function fetchAllOfficesAction()
    {
        $this->view->disable();
    
        $offices = Office::find();
        if ($offices) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $offices->toArray()
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No offices found.'
            ])->send();
        }
    }

    public function updateStartTimeAction($control_no)
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody();

        $report = ItrmServiceReport::findFirstByControlNo($control_no);
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'error', 
                'message' => 'Report not found'
            ]);
        }

        if (property_exists($data, 'date_started')) {
            $report->date_started = $data->date_started ? date('Y-m-d H:i:s', strtotime($data->date_started)) : null;
        }

        if (property_exists($data, 'start_time')) {
            $report->start_time = $data->start_time ? date('H:i:s', strtotime($data->start_time)) : null;
        }

        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success', 
                'message' => 'Start time updated successfully'
            ]);
        } else {
            $messages = [];
            foreach ($report->getMessages() as $message) {
                $messages[] = $message->getMessage();
            }
            return $this->response->setJsonContent([
                'status' => 'error', 
                'message' => implode(', ', $messages)
            ]);
        }
    }

    // function to accomplish the task  
    // public function updateItrmServiceReportAction($control_no)
    // {
    //     $this->view->disable();
    //     $data = $this->request->getJsonRawBody();
    
    //     $report = ItrmServiceReport::findFirstByControlNo($control_no);
    //     if (!$report) {
    //         return $this->response->setJsonContent(['status' => 'error', 'message' => 'Report not found']);
    //     }
    
    //     $updatableFields = [
    //         'services', 'service_level_id', 'service_quantity_id', 'action_taken', 
    //         'remarks', 'date_started', 'datetime_accomplished', 
    //         'request_status', 'start_time', 'end_time'
    //     ];
    //     foreach ($updatableFields as $field) {
    //         if (property_exists($data, $field)) {
    //             $value = $data->$field;
    //             if (in_array($field, ['datetime_accomplished', 'date_started'])) {
    //                 $value = $value ? date('Y-m-d H:i:s', strtotime($value)) : null;
    //             } elseif (in_array($field, ['services', 'service_level_id', 'service_quantity_id'])) {
    //                 $value = json_encode($value);
    //             } elseif (in_array($field, ['start_time', 'end_time', 'task_duration'])) {
    //                 $value = $value ? date('H:i:s', strtotime($value)) : null;
    //             }
    //             $report->$field = $value;
    //         }
    //     }
    //     $report->request_status = 'For Release';
    //         if ($report->start_time && $report->end_time) {
    //             $start = strtotime($report->start_time);
    //             $end = strtotime($report->end_time);

    //             if ($end >= $start) {
    //                 $totalDuration = 0;

    //                 // Define time blocks
    //                 $workBlocks = [
    //                     ['start' => '08:00:00', 'end' => '12:00:00'],
    //                     ['start' => '13:00:00', 'end' => '17:00:00'],
    //                 ];

    //                 foreach ($workBlocks as $block) {
    //                     $blockStart = strtotime($block['start']);
    //                     $blockEnd = strtotime($block['end']);

    //                     $overlapStart = max($start, $blockStart);
    //                     $overlapEnd = min($end, $blockEnd);

    //                     if ($overlapStart < $overlapEnd) {
    //                         $totalDuration += ($overlapEnd - $overlapStart);
    //                     }
    //                 }

    //                 $hours = floor($totalDuration / 3600);
    //                 $minutes = floor(($totalDuration % 3600) / 60);
    //                 $seconds = $totalDuration % 60;

    //                 $report->task_duration = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
    //             } else {
    //                 $report->task_duration = null; 
    //             }
    //         }
    //             if ($report->save()) {
    //                 return $this->response->setJsonContent(['status' => 'success', 'message' => 'Report updated successfully']);
    //             } else {
    //                 $messages = [];
    //                 foreach ($report->getMessages() as $message) {
    //                     $messages[] = $message->getMessage();
    //                 }
    //                 return $this->response->setJsonContent(['status' => 'error', 'message' => implode(', ', $messages)]);
    //             }
    // }
    public function updateItrmServiceReportAction($control_no)
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody();

        $report = ItrmServiceReport::findFirstByControlNo($control_no);
        if (!$report) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Report not found']);
        }

        $updatableFields = [
            'services', 'service_level_id', 'service_quantity_id', 'action_taken', 
            'remarks', 'date_started', 'datetime_accomplished', 
            'request_status', 'start_time', 'end_time'
        ];

        foreach ($updatableFields as $field) {
            if (property_exists($data, $field)) {
                $value = $data->$field;

                if (in_array($field, ['datetime_accomplished', 'date_started'])) {
                    $value = $value ? date('Y-m-d H:i:s', strtotime($value)) : null;
                } elseif (in_array($field, ['services', 'service_level_id', 'service_quantity_id'])) {
                    $value = json_encode($value);
                } elseif (in_array($field, ['start_time', 'end_time', 'task_duration'])) {
                    $value = $value ? date('H:i:s', strtotime($value)) : null;
                } elseif (in_array($field, ['remarks', 'action_taken'])) {
                    // Normalize to sentence format: first letter capitalized, ends with a period
                    $value = trim(strip_tags($value));
                    $value = ucfirst(strtolower($value));
                    $value = rtrim($value, '.') . '.';
                }

                $report->$field = $value;
            }
        }

        $report->request_status = 'For Release';

        if ($report->start_time && $report->end_time) {
            $start = strtotime($report->start_time);
            $end = strtotime($report->end_time);

            if ($end >= $start) {
                $totalDuration = 0;

                $workBlocks = [
                    ['start' => '08:00:00', 'end' => '12:00:00'],
                    ['start' => '13:00:00', 'end' => '17:00:00'],
                ];

                foreach ($workBlocks as $block) {
                    $blockStart = strtotime($block['start']);
                    $blockEnd = strtotime($block['end']);

                    $overlapStart = max($start, $blockStart);
                    $overlapEnd = min($end, $blockEnd);

                    if ($overlapStart < $overlapEnd) {
                        $totalDuration += ($overlapEnd - $overlapStart);
                    }
                }

                $hours = floor($totalDuration / 3600);
                $minutes = floor(($totalDuration % 3600) / 60);
                $seconds = $totalDuration % 60;

                $report->task_duration = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
            } else {
                $report->task_duration = null;
            }
        }

        if ($report->save()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Report updated successfully']);
        } else {
            $messages = [];
            foreach ($report->getMessages() as $message) {
                $messages[] = $message->getMessage();
            }
            return $this->response->setJsonContent(['status' => 'error', 'message' => implode(', ', $messages)]);
        }
    }

    public function saveSignatureAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
    
        $reportId = $this->filter->sanitize($rawData['reportId'], 'int');
        $signature = $rawData['signature']; 
    
        $report = ItrmServiceReport::findFirstById($reportId);
    
        if (!$report) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Report not found.'
            ]);
        }
    
        $report->signature = $signature;
    
        if ($report->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Signature saved successfully.'
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Failed to save signature.',
                'errors' => $report->getMessages()
            ]);
        }
    }   

    // function for (For Release)
    public function updateItrmServiceReportRequestStatusAction($control_no)
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody();
    
        $report = ItrmServiceReport::findFirstByControlNo($control_no);
        if (!$report) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Report not found']);
        }
    
        $updatableFields = [
            'date_released', 'released', 'request_status',
            'released_to'
        ];
    
        foreach ($updatableFields as $field) {
            if (property_exists($data, $field)) {
                $value = $data->$field;
                if (in_array($field, ['date_started', 'datetime_accomplished', 'date_released'])) {
                    $value = $value ? date('Y-m-d H:i:s', strtotime($value)) : null;
                }
                $report->$field = $field === 'services' || $field === 'service_level_id' ? json_encode($value) : $value;
            }
        }
        if (!$report->date_released) {
            $currentDateTime = new DateTime('now', new DateTimeZone('Asia/Manila'));
            $report->date_released = $currentDateTime->format('Y-m-d H:i:s');
        }
        $report->request_status = 'Released';


        if ($report->date_started && $report->datetime_accomplished) {
            try {
                $start = new DateTime($report->date_started);
                $end = new DateTime($report->datetime_accomplished);

                $workingSeconds = $this->calculateWorkingTime($start, $end);

                $hours = floor($workingSeconds / 3600);
                $minutes = floor(($workingSeconds % 3600) / 60);
                $seconds = $workingSeconds % 60;

                $report->process_time = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

            } catch (Exception $e) {
                $report->process_time = null;
            }
        }
        if ($report->save()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Report updated successfully']);
        } else {
            $messages = [];
            foreach ($report->getMessages() as $message) {
                $messages[] = $message->getMessage();
            }
            return $this->response->setJsonContent(['status' => 'error', 'message' => implode(', ', $messages)]);
        }
    }

    private function calculateWorkingHours(\DateTime $start, \DateTime $end): int
    {
        $totalSeconds = 0;
        $interval = new \DateInterval('PT1M');
        $period = new \DatePeriod($start, $interval, $end);

        foreach ($period as $dt) {
            $hour = (int) $dt->format('H');
            $minute = (int) $dt->format('i');

            if (
                ($hour >= 8 && $hour < 12) || 
                ($hour >= 13 && $hour < 17)  
            ) {
                $totalSeconds += 60;
            }
        }

        return $totalSeconds;
    }

    private function calculateWorkingTime(DateTime $start, DateTime $end): int
    {
        $workingSeconds = 0;

        $current = clone $start;
        $end = clone $end;

        while ($current < $end) {
            $workDay = clone $current;

            // working periods: 8AM–12PM and 1PM–5PM
            $workPeriods = [
                ['start' => clone $workDay->setTime(8, 0),  'end' => clone $workDay->setTime(12, 0)],
                ['start' => clone $workDay->setTime(13, 0), 'end' => clone $workDay->setTime(17, 0)],
            ];

            foreach ($workPeriods as $period) {
                $periodStart = max($period['start'], $start);
                $periodEnd = min($period['end'], $end);

                if ($periodEnd > $periodStart) {
                    $workingSeconds += $periodEnd->getTimestamp() - $periodStart->getTimestamp();
                }
            }

            $current->modify('+1 day')->setTime(0, 0);
        }

        return $workingSeconds;
    }
    
    public function generatePdfAction()
    {        
        $this->view->disable();

        // Initialize TCPDF
        $pdf = new TCPDF();
        $pdf->SetAuthor('Your Company');
        $pdf->SetTitle('Report');
        $pdf->SetSubject('Service Report');
        $pdf->AddPage();
        
        // Fetch the data sent from the Angular frontend
        $selectedReport = json_decode(file_get_contents('php://input'))->selectedReport;
        $currentUser = json_decode(file_get_contents('php://input'))->currentUser;

        // Fetch office_value from office table based on office_id
        $office_value = '';
        if (isset($selectedReport->office_id)) {
            // Using direct model access instead of PHQL
            $office = Office::findFirst([
                'conditions' => 'office_id = ?1',
                'bind' => [1 => $selectedReport->office_id]
            ]);
            
            if ($office) {
                $office_value = $office->office_value;
            }
        }

        // Custom Header Layout
        $pdf->Image('C:/U2/UniServerZ/ssl/ets/ets/src/assets/quezon logo.png', 12, 13, 15, 15);  
        // horizontal,vertical,width,height
        $pdf->SetFont('helvetica', 'B', 12);  
        $pdf->SetXY(30, 12); 
        $pdf->MultiCell(0, 15, 'Provincial Information and Communications Technology Office', 0, 'L');
        
        $pdf->SetFont('helvetica', '', 10);  
        $pdf->SetXY(30, 17);  
        $pdf->MultiCell(0, 10, 'Address: 2nd Floor Finance Building, Provincial Capitol Compound, Lucena City', 0, 'L');
        $pdf->SetXY(30, 21);  
        $pdf->MultiCell(0, 10, 'Tel. Number: (042) 719 - 1324', 0, 'L');
        $pdf->SetXY(30, 25);  
        $pdf->MultiCell(0, 10, 'Email Address: picto@quezon.gov.ph', 0, 'L'); 

        $pdf->Ln(20);
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->SetXY(10, 33);  
        $pdf->MultiCell(0, 10, 'IT Repair & Maintenance', 0, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetXY(10, 40);  
        $pdf->MultiCell(0, 10, 'SERVICE REPORT', 0, 'L');

        // Generate the barcode for control_no in CODE 128 C format
        //hori,verti,wid,hei,bar wid
        $pdf->write1DBarcode($selectedReport->control_no, 'C128', 147, 33, 53, 8, 0.3, array(), 'N');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetXY(149, 41);  
        $pdf->MultiCell(0, 10, 'Control No. '. $selectedReport->control_no, 0, 'L');

        $pdf->Line(10, 48, 200, 48); 

        $pdf->Ln(10); 

        $pdf->SetFont('helvetica', '', 10);

        $pdf->SetXY(10, 50);  
        $pdf->MultiCell(90, 10, 'Date of Request: ' . date('m/d/Y h:i A', strtotime($selectedReport->date_of_request)), 0, 'L');

        $pdf->SetXY(105, 50);  
        $pdf->MultiCell(90, 10, 'Date Released: ' . date('m/d/Y h:i A', strtotime($selectedReport->date_released)), 0, 'L');
    
        $pdf->SetXY(105, 55);  
        $pdf->MultiCell(90, 10, 'Released To: ' . $selectedReport->released_to, 0, 'L');
        
        // Signature field with base64 image
        if (!empty($selectedReport->signature)) {
            $base64_signature = $selectedReport->signature;
            
            $base64_signature = preg_replace('/^data:image\/(png|jpeg|jpg);base64,/', '', $base64_signature);

            $pdf->Image('@' . base64_decode($base64_signature), 140, 51, 50, 20);  
        }

        // Client Info - Modified table structure with text overflow handling
        $pdf->SetFont('helvetica', '', 10); 
        $pdf->SetXY(10, 65);

        // First Row - Name and Contact No separated into label and value columns
        $pdf->Cell(25, 10, 'Name:', 1, 0, 'L');  
        $pdf->Cell(65, 10, $selectedReport->name, 1, 0, 'L');
        $pdf->Cell(30, 10, 'Contact No:', 1, 0, 'L');  
        $pdf->Cell(60, 10, $selectedReport->contact_no, 1, 1, 'L'); 

        // Second Row - Department and Property No separated
        $pdf->Cell(25, 10, 'Department:', 1, 0, 'L');  
        $pdf->SetFont('helvetica', '', 9);
        $pdf->Cell(65, 10, $office_value, 1, 0, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(30, 10, 'Property No:', 1, 0, 'L');  
        $pdf->Cell(60, 10, $selectedReport->property_no, 1, 1, 'L');

        // Third Row - Department Head with proper text overflow handling
        // Create a multi-line cell for the department head section
        $deptHeadLabel = 'Department Head / Immediate Supervisor:';
        $deptHeadValue = isset($selectedReport->dept_head) ? $selectedReport->dept_head : '';
        
        // Format approval datetime if it exists
        $approvalDatetime = '';
        if (isset($selectedReport->approval_datetime) && !empty($selectedReport->approval_datetime)) {
            $approvalDatetime = 'Approval Date: ' . date('F j, Y g:i A', strtotime($selectedReport->approval_datetime));
        }
        
        // Calculate the height needed for the department head text
        $pdf->SetFont('helvetica', '', 9); // Use smaller font for better fit
        
        // Get the height needed for the text
        $labelHeight = $pdf->getStringHeight(25, $deptHeadLabel);
        $valueHeight = $pdf->getStringHeight(65, $deptHeadValue);
        $approvalHeight = $pdf->getStringHeight(90, $approvalDatetime);
        $cellHeight = max($labelHeight, $valueHeight, $approvalHeight, 10); // Minimum 10 units height
        
        // Draw the cells with calculated height
        $currentX = $pdf->GetX();
        $currentY = $pdf->GetY();
        
        // Label cell
        $pdf->MultiCell(25, $cellHeight, $deptHeadLabel, 1, 'L', false, 0, $currentX, $currentY);
        
        // Value cell with text wrapping
        $pdf->MultiCell(65, $cellHeight, $deptHeadValue, 1, 'L', false, 0, $currentX + 25, $currentY);
        
        // Approval datetime cell - you can change the alignment here
        $pdf->MultiCell(90, $cellHeight, $approvalDatetime, 1, 'L', false, 1, $currentX + 90, $currentY);
        
        // Reset font size
        $pdf->SetFont('helvetica', '', 10);

        // Update Y position after the department head section
        $pdf->SetY($currentY + $cellHeight);

        // Set consistent starting position for content sections
        $contentStartY = $pdf->GetY() + 5; // Add some spacing after the table
        
        // Description of Issue and Service(s) Rendered with consistent spacing
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetXY(10, $contentStartY);
        $pdf->MultiCell(90, 10, 'Description of Issue:', 0, 'L');
        
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetXY(10, $contentStartY + 9);
        $pdf->SetCellPadding(4);
        $pdf->SetFillColor(249, 249, 249); 
        $pdf->SetDrawColor(0, 0, 0);
        
        // Store the Y position before the MultiCell
        $beforeDescY = $pdf->GetY();
        $pdf->MultiCell(90, 0, $selectedReport->issue_request, 1, 'L', true);  
        $afterDescY = $pdf->GetY();
        $descHeight = $afterDescY - $beforeDescY;

        if (!empty($selectedReport->selectedServiceNames)) {
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetXY(105, $contentStartY);
            $pdf->MultiCell(90, 10, 'Service(s) Rendered:', 0, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetXY(105, $contentStartY + 9);
            $pdf->SetCellPadding(4);
            $pdf->SetFillColor(249, 249, 249); 
            $pdf->SetDrawColor(0, 0, 0); 
            $pdf->MultiCell(90, 0, implode(', ', $selectedReport->selectedServiceNames), 1, 'L', true);  
        }

        // Action Taken and Remarks - positioned relative to the actual end of description section
        $actionStartY = $contentStartY + $descHeight + 15; // 15 for spacing
        
        if (!empty($selectedReport->action_taken)) {
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetXY(10, $actionStartY);
            $pdf->MultiCell(90, 10, 'Action Taken:', 0, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetXY(10, $actionStartY + 9);
            $pdf->SetCellPadding(4);
            $pdf->SetFillColor(249, 249, 249); 
            $pdf->SetDrawColor(0, 0, 0);
            
            $beforeActionY = $pdf->GetY();
            $pdf->MultiCell(90, 0, $selectedReport->action_taken, 1, 'L', true);  
            $afterActionY = $pdf->GetY();
            $actionHeight = $afterActionY - $beforeActionY;
        } else {
            $actionHeight = 0;
        }

        if (!empty($selectedReport->remarks)) {
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetXY(105, $actionStartY);
            $pdf->MultiCell(90, 10, 'Remarks:', 0, 'L');
            $pdf->SetFont('helvetica', '', 10);
            $pdf->SetXY(105, $actionStartY + 9);
            $pdf->SetCellPadding(4);
            $pdf->SetFillColor(249, 249, 249); 
            $pdf->SetDrawColor(0, 0, 0); 
            $pdf->MultiCell(90, 0, $selectedReport->remarks, 1, 'L', true);  
        }

        // Date & Time information - positioned relative to the actual content height
        $footerY = $actionStartY + max($actionHeight, 30) + 10; // Use max to ensure minimum spacing
        
        $pdf->SetXY(7, $footerY);  
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(90, 10, 'Date & Time Started: ' . date('m/d/Y h:i A', strtotime($selectedReport->date_started)), 0, 'L');

        $pdf->SetXY(7, $footerY + 5);  
        $pdf->MultiCell(90, 10, 'Date & Time Accomplished: ' . date('m/d/Y h:i A', strtotime($selectedReport->datetime_accomplished)), 0, 'L');
    
        // Technical Staff
        $pdf->SetXY(114, $footerY);      
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(90, 10, 'Technical Staff: '. $currentUser->name, 0, 'L');
    
        // Noted by below Technical Staff
        $pdf->SetXY(114, $footerY + 5);      
        $pdf->MultiCell(90, 10, 'Noted by: Leney C. Laygo', 0, 'L');

        ob_clean();  
        $pdf->Output('report.pdf', 'I'); 
        exit();
    }

   // fetch divisions 
    public function fetchDivisionsAction()
    {
        $this->view->disable();
    
        $requestData = json_decode($this->request->getRawBody());
        $officeId = $requestData->office_id ?? null;
    
        $conditions = '';
        $bind = [];
    
        if ($officeId) {
            $conditions = 'office_id = :office_id:';
            $bind = ['office_id' => $officEId];
        }
    
        $divisions = Divisions::find([
            'conditions' => $conditions,
            'bind'       => $bind
        ]);
    
        $divisionArray = [];
        foreach ($divisions as $division) {
            $divisionArray[] = [
                'division_id' => $division->division_id,
                'division_name' => $division->division_name,
                'office_id' => $division->office_id
            ];
        }
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $divisionArray
        ]);
    }

    // change your password
    public function changePasswordAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);
        
        $factory = new FilterFactory();
        $locator = $factory->newInstance();
        
        $response_array = array();
    
        $auth = $this->session->get('auth');
        $id_number = $auth['id'];
    
        $current_password = $locator->sanitize($rawData['current_password'], ['striptags', 'string']);
        $new_password = $locator->sanitize($rawData['new_password'], ['striptags', 'string']);
    
        $user = Users::findFirstByIdNumber($id_number);
    
        if ($user) {
            if ($this->security->checkHash($current_password, $user->password)) {
                $user->password = $this->security->hash($new_password);
                if ($user->save()) {
                    $response_array = [
                        'status' => 'success',
                        'message' => 'Password changed successfully.'
                    ];
                } else {
                    $response_array = [
                        'status' => 'fail',
                        'message' => 'Failed to update password.'
                    ];
                }
            } else {
                $response_array = [
                    'status' => 'fail',
                    'message' => 'Current password is incorrect.'
                ];
            }
        } else {
            $response_array = [
                'status' => 'fail',
                'message' => 'User not found.'
            ];
        }
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }
}