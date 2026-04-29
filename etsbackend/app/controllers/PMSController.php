<?php
declare(strict_types=1);

class PMSController extends \Phalcon\Mvc\Controller
{

    // Add New Device Information
    public function saveNewDeviceAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody();
        $maintenance = new PreventiveMaintenance();

        $maintenance->accountable_person = $data->accountablePerson;
        $maintenance->end_user = $data->endUser;
        $maintenance->designation = json_encode($data->designation);
        $maintenance->equipment_type = json_encode($data->equipmentType);
        $maintenance->par_ics = $data->par;
        $maintenance->computer_name = $data->computerName;
        $maintenance->office_id = $data->department;
        $maintenance->division_id = $data->division;
        $maintenance->status = json_encode($data->status);
        $maintenance->hardware_information = json_encode($data->hardwareInformation);
        $maintenance->software_information = json_encode($data->softwareInformation);
        $maintenance->network_information = json_encode($data->networkInformation);

        if ($maintenance->save()) {
            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Data saved successfully'
            ]);
            } else {
                $errors = [];
                foreach ($maintenance->getMessages() as $message) {
                    $errors[] = $message->getMessage();
                }

                return $this->response->setJsonContent([
                    'status' => 'error',
                    'message' => 'Failed to save data',
                    'errors' => $errors
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

    public function getAccountableInfoAction()
    {
        $this->view->disable();

        try {
            // Fetch all records from preventive_maintenance table
            $maintenanceRecords = PreventiveMaintenance::find();
            
            $accountableData = [];
            
            foreach ($maintenanceRecords as $record) {
                $accountableData[] = [
                    'id' => $record->id,
                    'accountable_person' => $record->accountable_person,
                    'end_user' => $record->end_user,
                    'designation' => $record->designation,
                    'equipment_type' => $record->equipment_type,
                    'par_ics' => $record->par_ics,
                    'computer_name' => $record->computer_name,
                    'office_id' => $record->office_id,
                    'division_id' => $record->division_id,
                    'status' => $record->status,
                    'hardware_information' => $record->hardware_information,
                    'software_information' => $record->software_information,
                    'network_information' => $record->network_information,

                ];
            }
            
            return $this->response->setJsonContent([
                'status' => 'success',
                'data' => $accountableData,
                'count' => count($accountableData)
            ]);
            
        } catch (Exception $e) {
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Failed to fetch accountable information',
                'error' => $e->getMessage()
            ]);
        }
    }
    
}


