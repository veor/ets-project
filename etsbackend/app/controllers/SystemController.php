<?php
declare(strict_types=1);
use Phalcon\Filter\FilterFactory;
use Phalcon\Http\Response;

class SystemController extends \Phalcon\Mvc\Controller
{
    public function getUserInfoAction()
    {
        $this->view->disable();

        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');

        if (isset($auth['id'])) {
            $id_number = $auth['id'];
        } else {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID not found in session.',
            ])->send();
        }

        // Find the user by ID number
        $user = Users::findFirstByIdNumber($id_number);

        if ($user) {
            $office      = Office::findFirst($user->office_id);
            $division    = Divisions::findFirst($user->division_id);
            $permissions = json_decode($user->permissions, true);

            $response_array = [
                'status' => 'success',
                'data'   => [
                    'id_number'     => $user->id_number,
                    'name'          => $user->name,
                    'designation'   => $user->designation,
                    'office_id'     => $office ? $office->office_id : null,
                    'office_name'   => $office ? $office->office_name : null,
                    'division_id'   => $division ? $division->division_id : null,
                    'division_name' => $division ? $division->division_name : null,
                    'permissions'   => $permissions,
                ],
            ];
        } else {
            $response_array = [
                'status'  => 'fail',
                'message' => 'User not found',
            ];
        }

        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    public function getAuthUserPermsAction()
    {
        $this->view->disable();

        $auth = $this->session->get('auth');

        if (! isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID not found in session.',
            ])->send();
        }

        $id_number = $auth['id'];

        $user = Users::findFirstByIdNumber($id_number);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ])->send();
        }

        $permissions = json_decode($user->permissions);

        return $this->response->setJsonContent([
            'status'      => 'success',
            'permissions' => $permissions,
        ])->send();
    }

    public function getOfficeAction()
    {
        $this->view->disable();

        // Fetch all offices
        $offices = Office::find();

        // Format the offices into an array of names and IDs
        $officeArray = [];
        foreach ($offices as $office) {
            $officeArray[] = [
                'office_id'    => $office->office_id,
                'office_name'  => $office->office_name,
                'office_value' => $office->office_value,
            ];
        }

        $this->response->setJsonContent([
            'status' => 'success',
            'data'   => $officeArray,
        ]);
        return $this->response->send();
    }

    public function getDivisionsByOfficeAction($officeId)
    {
        $this->view->disable();

        // Fetch divisions for the given office ID
        $divisions = Divisions::find([
            'conditions' => 'office_id = :office_id:',
            'bind'       => ['office_id' => $officeId],
        ]);

        $divisionArray = [];
        foreach ($divisions as $division) {
            $divisionArray[] = [
                'division_id'   => $division->division_id,
                'division_name' => $division->division_name,
            ];
        }

        $this->response->setJsonContent([
            'status' => 'success',
            'data'   => $divisionArray,
        ]);
        return $this->response->send();
    }

    public function updateUserInfoAction()
    {
        $this->view->disable();

        $auth = $this->session->get('auth');

        if (! isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID not found in session.',
            ])->send();
        }

        $id_number = $auth['id'];

        $user = Users::findFirstByIdNumber($id_number);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ])->send();
        }

        $data = $this->request->getJsonRawBody();

        if (isset($data->name)) {
            $user->name = ucwords(strtolower($data->name));
        }

        if (isset($data->designation)) {
            $user->designation = $data->designation;
        }

        if (isset($data->office)) {
            $office          = Office::findFirst($data->office);
            $user->office_id = $office ? $office->office_id : null;
        }

        if (isset($data->division)) {
            $division          = Divisions::findFirst($data->division);
            $user->division_id = $division ? $division->division_id : null;
        }

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'User updated successfully.',
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Failed to update user.',
                'errors'  => $user->getMessages(),
            ])->send();
        }
    }

    public function changePasswordAction()
    {
        $this->view->disable();
        $rawData = $this->request->getJsonRawBody(true);

        $factory = new FilterFactory();
        $locator = $factory->newInstance();

        $response_array = [];

        // Get the current logged-in user's ID from the session
        $auth      = $this->session->get('auth');
        $id_number = $auth['id'];

        // Retrieve and sanitize the input
        $current_password = $locator->sanitize($rawData['current_password'], ['striptags', 'string']);
        $new_password     = $locator->sanitize($rawData['new_password'], ['striptags', 'string']);

        // Find the user
        $user = Users::findFirstByIdNumber($id_number);

        if ($user) {
            // Verify the current password
            if ($this->security->checkHash($current_password, $user->password)) {
                // Update the password
                $user->password = $this->security->hash($new_password);
                if ($user->save()) {
                    $response_array = [
                        'status'  => 'success',
                        'message' => 'Password changed successfully.',
                    ];
                } else {
                    $response_array = [
                        'status'  => 'fail',
                        'message' => 'Failed to update password.',
                    ];
                }
            } else {
                $response_array = [
                    'status'  => 'fail',
                    'message' => 'Current password is incorrect.',
                ];
            }
        } else {
            $response_array = [
                'status'  => 'fail',
                'message' => 'User not found.',
            ];
        }
        $this->response->setJsonContent($response_array);
        return $this->response->send();
    }

    public function getUserPermissionsAction()
    {
        $this->view->disable();

        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');

        if (! isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID not found in session.',
            ])->send();
        }

        $id_number = $auth['id'];

        $user = Users::findFirstByIdNumber($id_number);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ])->send();
        }

        $permissions = json_decode($user->permissions);

        return $this->response->setJsonContent([
            'status'      => 'success',
            'permissions' => $permissions,
        ])->send();
    }

    public function updateUserPermissionsAction()
    {
        $this->view->disable();

        // Get the current logged-in user's ID from the session
        $auth = $this->session->get('auth');

        if (! isset($auth['id'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID not found in session.',
            ])->send();
        }

        $id_number = $auth['id'];

        $user = Users::findFirstByIdNumber($id_number);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ])->send();
        }

        $data = $this->request->getJsonRawBody();

        if (! isset($data->permissions)) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Permissions data is required.',
            ])->send();
        }

        $user->permissions = json_encode($data->permissions);

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Permissions updated successfully.',
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Failed to update permissions.',
                'errors'  => $user->getMessages(),
            ])->send();
        }
    }

    // ALL USERS METHODS
    public function updateUserByAdminAction()
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody(true);

        $user = Users::findFirstByIdNumber($data['id_number']);
        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found',
            ]);
        }

        $user->name        = $data['name'];
        $user->designation = $data['designation'];
        $user->office_id   = $data['office_id'];
        $user->division_id = $data['division_id'];

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'User updated successfully.',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'fail',
            'message' => 'Update failed.',
        ]);
    }

    public function getUsersAction()
    {
        $this->view->disable();

        $users = Users::find([
            'columns' => 'id_number, name, designation, office_id, division_id, isActive',
        ]);

        $userData = [];

        foreach ($users as $user) {
            $office   = Office::findFirst($user->office_id);
            $division = Divisions::findFirst($user->division_id);

            $userData[] = [
                'id_number'   => $user->id_number,
                'name'        => $user->name,
                'designation' => $user->designation,
                'office_id'   => $user->office_id,
                'office'      => $office ? $office->office_name : null,
                'division_id' => $user->division_id,
                'division'    => $division ? $division->division_name : null,
                'isActive'    => $user->isActive,
            ];
        }

        return $this->response->setJsonContent([
            'status' => 'success',
            'data'   => $userData,
        ])->send();
    }
    // fetch selected user permission
    public function getSelUserPermsAction($idNumber)
    {
        $this->view->disable();

        $user = Users::findFirstByIdNumber($idNumber);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ]);
        }

        $permissions = json_decode($user->permissions, true);

        return $this->response->setJsonContent([
            'status' => 'success',
            'data'   => $permissions,
        ]);
    }
    // update selected user permission
    public function updateSelUserPermsAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody(true);

        if (! isset($data['id_number'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User ID is required.',
            ])->send();
        }

        if (! isset($data['permissions'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Permissions data is required.',
            ])->send();
        }

        $user = Users::findFirstByIdNumber($data['id_number']);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ])->send();
        }

        // Encode permissions array to JSON string
        $user->permissions = json_encode($data['permissions']);

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Permissions updated successfully.',
            ])->send();
        } else {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Failed to update permissions.',
                'errors'  => $user->getMessages(),
            ])->send();
        }
    }
    // update selected user password
    public function adminChangeUserPasswordAction()
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody(true);

        if (! isset($data['user_id']) || ! isset($data['new_password'])) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'Invalid input.',
            ]);
        }

        $user = Users::findFirstByIdNumber($data['user_id']);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'fail',
                'message' => 'User not found.',
            ]);
        }

        // Update password
        $user->password = $this->security->hash($data['new_password']);

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Password updated successfully.',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'fail',
            'message' => 'Failed to update password.',
        ]);
    }
    // update selected user active status
    public function updateUserStatusAction()
    {
        $this->view->disable();
        $response = new \Phalcon\Http\Response();

        if (! $this->request->isPost()) {
            return $response->setJsonContent(['status' => 'error', 'message' => 'Invalid request.']);
        }

        $data     = $this->request->getJsonRawBody(true);
        $idNumber = $data['id_number'] ?? null;
        $isActive = $data['is_active'] ?? null;

        if (! $idNumber || ! isset($isActive)) {
            return $response->setJsonContent(['status' => 'error', 'message' => 'Missing parameters.']);
        }

        $user = Users::findFirst([
            'conditions' => 'id_number = :id_number:',
            'bind'       => ['id_number' => $idNumber],
        ]);

        if (! $user) {
            return $response->setJsonContent(['status' => 'error', 'message' => 'User not found.']);
        }

        $user->isActive = $isActive;

        if ($user->save()) {
            return $response->setJsonContent(['status' => 'success', 'message' => 'User status updated successfully.']);
        } else {
            return $response->setJsonContent(['status' => 'error', 'message' => 'Failed to update user status.']);
        }
    }

    public function getAllOfficesAction()
    {
        $this->view->disable();

        try {
            $offices = Office::find([
                'order' => 'office_name ASC',
            ])->toArray();

            return $this->response->setJsonContent([
                'status' => 'success',
                'data'   => $offices,
            ]);
        } catch (\Exception $e) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Failed to fetch offices',
            ]);
        }
    }
    public function updateDepartmentAction()
    {
        $this->view->disable();
        $data = $this->request->getJsonRawBody(true);

        if (! isset($data['office_id'])) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Office ID is required',
            ]);
        }

        try {
            $office = Office::findFirst($data['office_id']);
            if (! $office) {
                return $this->response->setJsonContent([
                    'status'  => 'error',
                    'message' => 'Office not found',
                ]);
            }

            $office->office_name  = $data['office_name'] ?? $office->office_name;
            $office->office_value = $data['office_value'] ?? $office->office_value;
            $office->save();

            // Optionally update selected division for office
            if (! empty($data['division_id'])) {
                $division = Divisions::findFirst($data['division_id']);
                if ($division) {
                    $division->office_id = $office->office_id;
                    $division->save();
                }
            }

            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Department updated successfully',
            ]);
        } catch (\Exception $e) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Failed to update department',
            ]);
        }
    }
    public function getDivisionsByDeptAction($officeId)
    {
        $this->view->disable();

        $divisions = Divisions::find([
            'conditions' => 'office_id = :office_id:',
            'bind'       => ['office_id' => $officeId],
            'order'      => 'division_name ASC',
        ]);

        return $this->response->setJsonContent([
            'status' => 'success',
            'data'   => $divisions,
        ]);
    }
    public function addDivisionAction()
    {
        $this->view->disable();

        $body = $this->request->getJsonRawBody(true);

        $name     = isset($body['division_name']) ? trim($body['division_name']) : null;
        $officeId = isset($body['office_id']) ? (int) $body['office_id'] : null;

        if (! $name || ! $officeId) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Missing required fields',
            ]);
        }
        $name                    = ucwords(strtolower($name));
        $division                = new Divisions();
        $division->division_name = $name;
        $division->office_id     = $officeId;

        if ($division->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Division added successfully',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'error',
            'message' => 'Failed to save division',
        ]);
    }
    public function updateDivisionAction()
    {
        $this->view->disable();

        $data = $this->request->getJsonRawBody(true);

        $divisionId   = (int) ($data['division_id'] ?? 0);
        $divisionName = $data['division_name'] ?? '';

        // Capitalize first letter of each word
        $divisionName = ucwords(strtolower($divisionName));
        error_log("Updating division ID: $divisionId, Name: $divisionName");

        $division = Divisions::findFirst([
            'conditions' => 'division_id = :id:',
            'bind'       => ['id' => $divisionId],
        ]);

        if (! $division) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Division not found',
            ]);
        }

        $division->division_name = $divisionName;

        if ($division->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Division updated successfully',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'error',
            'message' => 'Failed to update division',
            'errors'  => $division->getMessages(),
        ]);
    }

    public function addOfficeAction()
    {
        $this->view->disable();
        $request = $this->request;
        if (! $request->isPost()) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Invalid request']);
        }

        $data         = $request->getJsonRawBody();
        $office_name  = trim($data->office_name);
        $office_value = trim($data->office_value);

        // Check if exists
        $existing = Office::findFirst([
            'conditions' => 'office_name = :name: OR office_value = :value:',
            'bind'       => ['name' => $office_name, 'value' => $office_value],
        ]);
        if ($existing) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Office already exists.']);
        }

        // Find the next available office_id
        $usedIds = Office::query()
            ->columns('office_id')
            ->orderBy('office_id ASC')
            ->execute()
            ->toArray();

        $usedIds = array_column($usedIds, 'office_id');

        $nextId = 1;
        foreach ($usedIds as $id) {
            if ($id != $nextId) {
                break;
            }
            $nextId++;
        }

        $office               = new Office();
        $office->office_id    = $nextId;
        $office->office_name  = $office_name;
        $office->office_value = $office_value;

        if ($office->save()) {
            return $this->response->setJsonContent(['status' => 'success', 'message' => 'Office added']);
        } else {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Failed to add office']);
        }
    }

    public function addUserAction()
    {
        $this->view->disable();

        if (! $this->request->isPost()) {
            return $this->response->setJsonContent(['status' => 'error', 'message' => 'Invalid request']);
        }

        $data = $this->request->getJsonRawBody(true);

        // Validate required fields
        if (empty($data['id_number']) || empty($data['name']) || empty($data['password'])) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'ID Number, Name, and Password are required',
            ]);
        }

        // Check if user already exists
        $existingUser = Users::findFirstByIdNumber($data['id_number']);
        if ($existingUser) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'User with this ID number already exists',
            ]);
        }

        $user            = new Users();
        $user->id_number = $data['id_number'];
        $user->name      = ucwords(strtolower($data['name']));
        // Transform designation to title case (ucwords handles this)
        $user->designation = ! empty($data['designation']) ? ucwords(strtolower($data['designation'])) : '';
        $user->office_id   = $data['office_id'] ?? null;
        $user->division_id = $data['division_id'] ?? null;
        $user->password    = $this->security->hash($data['password']);
        $user->isActive    = 1;
        $user->init_login  = 1;

        // Handle permissions - should already be JSON string from frontend
        $user->permissions = $data['permissions'] ?? '[]';

        if ($user->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'User added successfully',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'error',
            'message' => 'Failed to add user: ' . implode(", ", $user->getMessages()),
        ]);
    }

    public function getAllDivisionsAction()
    {
        $this->view->disable();

        try {
            $divisions = Divisions::find([
                'order' => 'division_name ASC',
            ]);

            $divisionData = [];
            foreach ($divisions as $division) {
                $office         = Office::findFirst($division->office_id);
                $divisionData[] = [
                    'division_id'   => $division->division_id,
                    'division_name' => $division->division_name,
                    'office_id'     => $division->office_id,
                    'office_name'   => $office ? $office->office_name : null,
                ];
            }

            return $this->response->setJsonContent([
                'status' => 'success',
                'data'   => $divisionData,
            ]);
        } catch (\Exception $e) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Failed to fetch divisions',
            ]);
        }
    }

    public function addPersonnelAction()
    {
        $this->view->disable();

        if (! $this->request->isPost()) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Invalid request',
            ]);
        }

        $data = $this->request->getJsonRawBody(true);

        // Validate required fields
        if (empty($data['personnel_id']) || empty($data['personnel_name']) || empty($data['division_id'])) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Personnel ID, Name, and Division are required',
            ]);
        }

        // Check if personnel already exists
        $existingPersonnel = Personnels::findFirst([
            'conditions' => 'personnel_id = :id:',
            'bind'       => ['id' => $data['personnel_id']],
        ]);

        if ($existingPersonnel) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'Personnel with this ID already exists',
            ]);
        }

        $personnel               = new Personnels();
        $personnel->personnel_id = $data['personnel_id'];
        // Transform name to title case
        $personnel->personnel_name = ucwords(strtolower($data['personnel_name']));
        $personnel->division_id    = $data['division_id'];
        $personnel->division_name  = $data['division_name'] ?? '';

        if ($personnel->save()) {
            return $this->response->setJsonContent([
                'status'  => 'success',
                'message' => 'Technical staff added successfully',
            ]);
        }

        return $this->response->setJsonContent([
            'status'  => 'error',
            'message' => 'Failed to add technical staff: ' . implode(", ", $personnel->getMessages()),
        ]);
    }

    public function getUserByIdAction($idNumber)
    {
        $this->view->disable();

        if (empty($idNumber)) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'ID number is required',
            ]);
        }

        $user = Users::findFirstByIdNumber($idNumber);

        if (! $user) {
            return $this->response->setJsonContent([
                'status'  => 'error',
                'message' => 'User not found',
            ]);
        }

        $office   = Office::findFirst($user->office_id);
        $division = Divisions::findFirst($user->division_id);

        return $this->response->setJsonContent([
            'status' => 'success',
            'data'   => [
                'id_number'     => $user->id_number,
                'name'          => $user->name,
                'designation'   => $user->designation,
                'office_id'     => $user->office_id,
                'office_name'   => $office ? $office->office_name : null,
                'division_id'   => $user->division_id,
                'division_name' => $division ? $division->division_name : null,
            ],
        ]);
    }

}

