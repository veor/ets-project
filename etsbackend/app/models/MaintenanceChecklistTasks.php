<?php

class MaintenanceChecklistTasks extends \Phalcon\Mvc\Model
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
    public $template_id;

    /**
     *
     * @var integer
     */
    public $task_order;

    /**
     *
     * @var string
     */
    public $task_description;

    /**
     *
     * @var integer
     */
    public $is_active;

    /**
     * Initialize method for model.
     */
    public function initialize()
    {
        $this->setSchema("etsdb");
        $this->setSource("maintenance_checklist_tasks");
        $this->hasMany('id', 'MaintenanceChecklistLogTasks', 'checklist_task_id', ['alias' => 'MaintenanceChecklistLogTasks']);
        $this->belongsTo('template_id', '\MaintenanceChecklistTemplates', 'id', ['alias' => 'MaintenanceChecklistTemplates']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistTasks[]|MaintenanceChecklistTasks|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistTasks|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
