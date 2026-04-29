<?php
declare(strict_types=1);

class ClientController extends \Phalcon\Mvc\Controller
{
    // fetch request division which is IT & Repair Maintenance 
    public function getRequestDivisionAction()
    {
        $this->view->disable(); 

        $requestDivisions = RequestDivision::find(); 

        if ($requestDivisions) {
            $response = [
                'status' => 'success',
                'data' => $requestDivisions->toArray() 
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
    // fetch offices 
    public function getOfficesAction()
    {
        $this->view->disable();
    
        $offices = Office::find();
        $officeData = [];
    
        foreach ($offices as $office) {
            $officeData[] = [
                'office_id' => $office->office_id,
                'office_name' => $office->office_name
            ];
        }
    
        return $this->response->setJsonContent([
            'status' => 'success',
            'data' => $officeData
        ]);
    }
    // fetch divisions 
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
    // submit service request to their respective office/division 
    // public function createServiceReportAction()
    // {
    //     $this->view->disable();
    //     $rawData = $this->request->getJsonRawBody(true);
    
    //     // $name = trim(strip_tags($rawData['name']));
    //     $name = ucwords(strtolower(trim(strip_tags($rawData['name']))));
    //     $property_no = trim(strip_tags($rawData['property_no']));
    //     $contact = trim(strip_tags($rawData['contact']));
    //     $dept_head = trim(strip_tags($rawData['dept_head']));
    //     $requestDiv_Id = (int)$rawData['requestDiv_Id'];
    //     $office_id = (int)$rawData['office_id'];
    //     $division_id = (int)$rawData['division_id'];
    //     $issue_request = trim(strip_tags($rawData['issue_request']));

    //     $targetTable = null;
    //     // switch ($division_id) {
    //     switch ($requestDiv_Id) {
    //         case 1:
    //             $targetTable = new ItrmServiceReport();
    //             break;
    //         // case 2:
    //         //     $targetTable = new SysdevServiceReport();
    //         //     break;
    //         // case 3:
    //         //     $targetTable = new CwServiceReport();
    //         //     break;
    //         default:
    //             $this->response->setJsonContent(['status' => 'fail', 'message' => 'Invalid division ID.']);
    //             return $this->response->send();
    //     }
    
    //     $targetTable->name = $name;
    //     $targetTable->contact_no = $contact;
    //     $targetTable->dept_head = $dept_head;
    //     $targetTable->office_id = $office_id;
    //     $targetTable->division_id = $division_id;
    //     $targetTable->issue_request = $issue_request;
    //     $targetTable->personnel_id = null;
    //     $targetTable->requestDiv_Id = $requestDiv_Id;
    //     $targetTable->approval_status = 0; // Default to unapproved
    //     $targetTable->property_no = $property_no;
    //     $targetTable->date_of_request = null; // Default to empty
    //     $targetTable->dept_sign = null; // Default to empty
    //     $targetTable->request_status = "Our technical staff will assist you as soon as they become available";
    
    //     if ($targetTable->save()) {
    //         $this->response->setJsonContent(['status' => 'success', 'message' => 'Service report created successfully.']);
    //     } else {
    //         $this->response->setJsonContent(['status' => 'fail', 'message' => 'Failed to save service report.', 'errors' => $targetTable->getMessages()]);
    //     }
    
    //     return $this->response->send();
    // }
    public function createServiceReportAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);

        $name = ucwords(strtolower(trim(strip_tags($rawData['name']))));
        $property_no = trim(strip_tags($rawData['property_no']));
        $contact = trim(strip_tags($rawData['contact']));
        $dept_head = trim(strip_tags($rawData['dept_head']));
        $requestDiv_Id = (int)$rawData['requestDiv_Id'];
        $office_id = (int)$rawData['office_id'];
        $division_id = (int)$rawData['division_id'];

        // issue_request sentence format capitalize first letter ends with a period
        $issue_request = trim(strip_tags($rawData['issue_request']));
        $issue_request = ucfirst(strtolower($issue_request));
        $issue_request = rtrim($issue_request, '.') . '.';

        $targetTable = null;
        // switch ($requestDiv_Id) {
        //     case 1:
        //         $targetTable = new ItrmServiceReport();
        //         break;
        //     default:
        //         $this->response->setJsonContent(['status' => 'fail', 'message' => 'Invalid division ID.']);
        //         return $this->response->send();
        // }
        switch ($requestDiv_Id) {
            case 1:
                $targetTable = new ItrmServiceReport();
                break;
            case 2:
                $targetTable = new SysdevServiceReport();
                break;
            case 3:
                $targetTable = new CwServiceReport();
                break;
            default:
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Invalid request division.'
                ]);
        }

        $targetTable->name = $name;
        $targetTable->contact_no = $contact;
        $targetTable->dept_head = $dept_head;
        $targetTable->office_id = $office_id;
        $targetTable->division_id = $division_id;
        $targetTable->issue_request = $issue_request;
        $targetTable->personnel_id = null;
        $targetTable->requestDiv_Id = $requestDiv_Id;
        $targetTable->approval_status = 0;
        $targetTable->property_no = $property_no;
        $targetTable->date_of_request = null;
        $targetTable->dept_sign = null;
        $targetTable->request_status = "Our technical staff will assist you as soon as they become available";

        if ($targetTable->save()) {
            $this->response->setJsonContent(['status' => 'success', 'message' => 'Service report created successfully.']);
        } else {
            $this->response->setJsonContent(['status' => 'fail', 'message' => 'Failed to save service report.', 'errors' => $targetTable->getMessages()]);
        }

        return $this->response->send();
    }
    // fetch and display data on table  
    public function getServiceReportAction()
    {
        $this->view->disable();
        $query = $this->request->getQuery('q', 'string');
    
        if (!$query) {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'Search query is required.'
            ]);
        }
    
        $reports = ItrmServiceReport::find([
            'conditions' => 'control_no LIKE :query: OR name LIKE :query:',
            'bind' => ['query' => '%' . $query . '%']
        ]);
    
        // Create a result set that includes the personnel_name 
        $result = [];
        foreach ($reports as $report) {
            $personnelId = $report->personnel_id;
        
            // fetch the user details from the 'users' table based on personnel_id
            $user = Users::findFirst([
                'conditions' => 'id_number = :personnel_id:',
                'bind' => ['personnel_id' => $personnelId]
            ]);
        
            // append the report data with the name from the users table
            $reportData = $report->toArray();
            $reportData['personnel_name'] = $user ? $user->name : 'N/A';
        
            $result[] = $reportData;
        }

        if (count($result) > 0) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $result
            ]);
        } else {
            return $this->response->setJsonContent([
                'status' => 'fail',
                'message' => 'No reports found.'
            ]);
        }
    }  

    
}

