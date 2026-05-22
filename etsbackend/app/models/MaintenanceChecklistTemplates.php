<?php

class MaintenanceChecklistTemplates extends \Phalcon\Mvc\Model
{

    /**
     *
     * @var integer
     */
    public $id;

    /**
     *
     * @var string
     */
    public $equipment_type;

    /**
     *
     * @var string
     */
    public $template_name;

    /**
     *
     * @var string
     */
    public $version_year;

    /**
     *
     * @var integer
     */
    public $is_active;

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
        $this->setSource("maintenance_checklist_templates");
        $this->hasMany('id', 'MaintenanceChecklistLogs', 'template_id', ['alias' => 'MaintenanceChecklistLogs']);
        $this->hasMany('id', 'MaintenanceChecklistTasks', 'template_id', ['alias' => 'MaintenanceChecklistTasks']);
    }

    /**
     * Allows to query a set of records that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistTemplates[]|MaintenanceChecklistTemplates|\Phalcon\Mvc\Model\ResultSetInterface
     */
    public static function find($parameters = null): \Phalcon\Mvc\Model\ResultsetInterface
    {
        return parent::find($parameters);
    }

    /**
     * Allows to query the first record that match the specified conditions
     *
     * @param mixed $parameters
     * @return MaintenanceChecklistTemplates|\Phalcon\Mvc\Model\ResultInterface|\Phalcon\Mvc\ModelInterface|null
     */
    public static function findFirst($parameters = null): ?\Phalcon\Mvc\ModelInterface
    {
        return parent::findFirst($parameters);
    }

}
