<?php

class MaintenanceChecklistLogs extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var integer
     */
    public $equipment_id;

    /**
     *
     * @var string
     */
    public $device_name;

    /**
     *
     * @var string
     */
    public $accountable_person;

    /**
     *
     * @var string
     */
    public $par_ics;

    /**
     *
     * @var string
     */
    public $equipment_type;

    /**
     *
     * @var integer
     */
    public $template_id;

    /**
     *
     * @var string
     */
    public $findings;

    /**
     *
     * @var string
     */
    public $recommendation;

    /**
     *
     * @var integer
     */
    public $created_by;

    /**
     *
     * @var string
     */
    public $created_at;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("maintenance_checklist_logs");
        $this->hasMany('id', 'MaintenanceChecklistLogTasks', 'checklist_log_id', ['alias' => 'MaintenanceChecklistLogTasks']);
        $this->belongsTo('template_id', '\MaintenanceChecklistTemplates', 'id', ['alias' => 'MaintenanceChecklistTemplates']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistLogs[]|MaintenanceChecklistLogs|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistLogs|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
