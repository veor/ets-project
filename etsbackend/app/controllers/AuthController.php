<?php
declare(strict_types=1);
// use Phalcon\Filter\FilterFactory;

class AuthController extends \Phalcon\Mvc\Controller
{

    public function indexAction()
    {

    }
    // public function loginAction()
    // {   
    //     $this->view->disable();
    //     $rawData = $this->request->getJsonRawBody(true);
        
    //     $factory = new FilterFactory();
    //     $locator = $factory->newInstance();
    
    //     $id_number = $locator->sanitize($rawData['id_number'], ['int']);
    //     $password = $locator->sanitize($rawData['password'], ['string']);
    
    //     $response_array = ['status' => 'fail', 'message' => 'Invalid credentials.'];
    
    //     $user = Users::findFirstByIdNumber($id_number);
    
    //     if ($user) {
    //         if ((int)$user->islocked === 1) {
    //             $response_array = [
    //                 'status' => 'fail',
    //                 'message' => 'Sorry, but your account has been deactivated.'
    //             ];
    //         } elseif ($this->security->checkHash($password, $user->password)) {
    //             $sessionToken = bin2hex(random_bytes(64));

    //             $this->session->set('auth', [
    //                 'token' => $sessionToken,
    //                 'id' => $user->id_number,
    //                 'name' => $user->name,
    //                 'permissions' => json_decode($user->permissions), 
    //                 'division_id' => $user->division_id,
    //                 'office_id' => $user->office_id, 
    //             ]);
    //             $user->last_login = date('Y-m-d H:i:s');
    //             $user->save();
    //             $response_array = [
    //                 'status' => 'success',
    //                 'message' => 'Login successful.',
    //                 'token' => $sessionToken,
    //                 'permissions' => $this->session->get('auth')['permissions'],
    //                 'isActive' => $user->isActive
    //             ];
    //         }
    //     }
        
    //         $this->response->setJsonContent($response_array);
    //         return $this->response->send();
    // }

    public function loginAction()
    {
        try {
            // Get JSON input
            $request = $this->request->getJsonRawBody();
            
            // Validate input
            if (!$request || !isset($request->id_number) || !isset($request->password)) {
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'ID number and password are required.'
                ]);
            }

            $idNumber = trim($request->id_number);
            $password = $request->password;

            // Basic input validation
            if (empty($idNumber) || empty($password)) {
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'ID number and password cannot be empty.'
                ]);
            }

            $user = Users::findFirstByIdNumber($idNumber);
            
            if (!$user) {
                // Log failed login attempt (optional - remove in production if needed)
                error_log("Failed login attempt for non-existent user: " . $idNumber);
                
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Invalid credentials.'
                ]);
            }

            // Check if account is locked
            if ((int)$user->islocked === 1) {
                error_log("Login attempt on locked account: " . $idNumber);
                
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Sorry, but your account has been deactivated.'
                ]);
            }

            // Check if account is active - handle both possible column names
            $isActive = $this->checkUserActiveStatus($user);
            
            if (!$isActive) {
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Account is not active.'
                ]);
            }

            // Verify password
            if (!$this->security->checkHash($password, $user->password)) {
                error_log("Failed login attempt with wrong password for user: " . $idNumber);
                
                // Track failed attempts
                $this->incrementFailedLoginAttempts($user);
                
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Invalid credentials.'
                ]);
            }

            // Password is correct - proceed with login
            return $this->processSuccessfulLogin($user, $isActive);

        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'An error occurred during login. Please try again.'
            ]);
        }
    }

    private function checkUserActiveStatus($user): bool
    {
        // Check both possible column names for active status
        if (property_exists($user, 'isActive')) {
            return ((int)$user->isActive === 1);
        } elseif (property_exists($user, 'is_active')) {
            return ((int)$user->is_active === 1);
        }
        
        return true;
    }

    private function processSuccessfulLogin($user, $isActive = true)
    {
        try {
            // Generate secure session token
            $sessionToken = bin2hex(random_bytes(64));
            
            // Get expiration from config (with fallback)
            $expiration = $this->config->jwt->expiration ?? 3600;
            
            // Create JWT payload
            $payload = [
                'id_number' => $user->id_number,
                'name' => $user->name,
                'iat' => time(),
                'exp' => time() + $expiration, // config expiration
                'session_token' => $sessionToken
            ];

            // Generate JWT token
            $jwtToken = $this->generateJWTToken($payload);

            // Set session data
            $this->session->set('auth', [
                'token' => $sessionToken,
                'id' => $user->id_number,
                'name' => $user->name,
                'permissions' => json_decode($user->permissions),
                'division_id' => $user->division_id,
                'office_id' => $user->office_id,
                'login_time' => time()
            ]);

            // Update user's last login
            $user->last_login = date('Y-m-d H:i:s');
            
            // Reset failed login attempts
            if (property_exists($user, 'failed_login_attempts')) {
                $user->failed_login_attempts = 0;
            }
            
            $user->save();

            error_log("Successful login for user: " . $user->id_number);

            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Login successful.',
                'token' => $jwtToken,
                'permissions' => json_decode($user->permissions),
                'isActive' => $isActive ? 1 : 0,
                'user' => [
                    'id_number' => $user->id_number,
                    'name' => $user->name,
                    'division_id' => $user->division_id,
                    'office_id' => $user->office_id
                ]
            ]);

        } catch (Exception $e) {
            error_log("Error in processSuccessfulLogin: " . $e->getMessage());
            
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Login processing failed. Please try again.'
            ]);
        }
    }

    private function generateJWTToken($payload)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $payloadEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $this->getJWTSecret(), true);
        $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }

    private function getJWTSecret()
    {
        if (isset($this->config->jwt->secret) && strlen($this->config->jwt->secret) >= 32) {
            return $this->config->jwt->secret;
        }
        
        error_log("CRITICAL: JWT Secret not found in config!");
        throw new Exception("JWT configuration error - secret not found");
    }

    private function incrementFailedLoginAttempts($user)
    {
        // Track failed login attempts
        if (property_exists($user, 'failed_login_attempts')) {
            $user->failed_login_attempts = ((int)$user->failed_login_attempts) + 1;
            
            // Lock account after 5 failed attempts
            if ($user->failed_login_attempts >= 5) {
                $user->islocked = 1;
                error_log("Account locked due to multiple failed attempts: " . $user->id_number);
            }
            
            $user->save();
        }
    }

    public function logoutAction()
    {
        try {
            $authData = $this->session->get('auth');
            
            if ($authData) {
                error_log("User logged out: " . $authData['id']);
                $this->session->destroy();
            }

            return $this->response->setJsonContent([
                'status' => 'success',
                'message' => 'Logged out successfully.'
            ]);

        } catch (Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Logout failed.'
            ]);
        }
    }

    public function validateTokenAction()
    {
        try {
            $authHeader = $this->request->getHeader('Authorization');
            
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'No valid token provided.'
                ]);
            }

            $token = substr($authHeader, 7); 
            
            if ($this->isValidJWTToken($token)) {
                return $this->response->setJsonContent([
                    'status' => 'success',
                    'message' => 'Token is valid.'
                ]);
            } else {
                return $this->response->setJsonContent([
                    'status' => 'fail',
                    'message' => 'Invalid or expired token.'
                ]);
            }

        } catch (Exception $e) {
            error_log("Token validation error: " . $e->getMessage());
            
            return $this->response->setJsonContent([
                'status' => 'error',
                'message' => 'Token validation failed.'
            ]);
        }
    }

    private function isValidJWTToken($token)
    {
        try {
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                return false;
            }

            [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;
            
            $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $this->getJWTSecret(), true);
            $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            if (!hash_equals($expectedSignature, $signatureEncoded)) {
                return false;
            }

            // Check expiration
            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadEncoded)), true);
            
            if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
                return false;
            }

            return true;

        } catch (Exception $e) {
            return false;
        }
    }

    // get authenticated user permissions (currently used in showing designated tabs)
    public function getUserPermsAction()
    {
        $this->view->disable();

        $userId = $this->session->get('auth')['id'];
        $user = Users::findFirstByIdNumber($userId);

        if ($user) {
                $response = [
                    'status' => 'success',
                    'data' => [
                        'name' => $user->name,
                        'permissions' => json_decode($user->permissions)
                    ]
                ];
            } else {
                $response = [
                    'status' => 'fail',
                    'message' => 'User not found.'
                ];
            }

            $this->response->setJsonContent($response);
            return $this->response->send();
    }

}

