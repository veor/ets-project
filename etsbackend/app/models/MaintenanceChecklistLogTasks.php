<?php

class MaintenanceChecklistLogTasks extends \Phalcon\Mvc\Model
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
    public $checklist_log_id;

    /**
     *
     * @var integer
     */
    public $checklist_task_id;

    /**
     *
     * @var integer
     */
    public $is_done;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("maintenance_checklist_log_tasks");
        $this->belongsTo('checklist_log_id', '\MaintenanceChecklistLogs', 'id', ['alias' => 'MaintenanceChecklistLogs']);
        $this->belongsTo('checklist_task_id', '\MaintenanceChecklistTasks', 'id', ['alias' => 'MaintenanceChecklistTasks']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistLogTasks[]|MaintenanceChecklistLogTasks|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistLogTasks|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
