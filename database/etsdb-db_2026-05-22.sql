-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 22, 2026 at 02:38 AM
-- Server version: 10.3.17-MariaDB
-- PHP Version: 7.3.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `etsdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `device_equipment_types`
--

CREATE TABLE `device_equipment_types` (
  `id` int(11) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `equipment_type` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `device_equipment_types`
--

INSERT INTO `device_equipment_types` (`id`, `device_id`, `equipment_type`) VALUES
(1, 1, 'Desktop'),
(2, 2, 'Laptop'),
(6, 6, 'Printer'),
(7, 7, 'Network Equipment'),
(9, 9, 'Laptop');

-- --------------------------------------------------------

--
-- Table structure for table `device_hardware`
--

CREATE TABLE `device_hardware` (
  `id` int(11) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `motherboard_brand` varchar(255) DEFAULT NULL,
  `motherboard_serial` varchar(255) DEFAULT NULL,
  `processor_brand` varchar(255) DEFAULT NULL,
  `processor_serial` varchar(255) DEFAULT NULL,
  `monitor_brand` varchar(255) DEFAULT NULL,
  `monitor_serial` varchar(255) DEFAULT NULL,
  `gpu_brand` varchar(255) DEFAULT NULL,
  `gpu_serial` varchar(255) DEFAULT NULL,
  `ups_brand` varchar(255) DEFAULT NULL,
  `ups_serial` varchar(255) DEFAULT NULL,
  `printer_brand` varchar(255) DEFAULT NULL,
  `printer_serial` varchar(255) DEFAULT NULL,
  `data_cabinet_brand` varchar(255) DEFAULT NULL,
  `data_cabinet_serial` varchar(255) DEFAULT NULL,
  `network_switch_brand` varchar(255) DEFAULT NULL,
  `network_switch_serial` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `device_hardware`
--

INSERT INTO `device_hardware` (`id`, `device_id`, `motherboard_brand`, `motherboard_serial`, `processor_brand`, `processor_serial`, `monitor_brand`, `monitor_serial`, `gpu_brand`, `gpu_serial`, `ups_brand`, `ups_serial`, `printer_brand`, `printer_serial`, `data_cabinet_brand`, `data_cabinet_serial`, `network_switch_brand`, `network_switch_serial`) VALUES
(1, 1, 'a_mother_brand', 'a_mother_serial', 'a_proc_brand', 'a_proc_serial', 'a_monitor_brand', 'a_monitor_serial', 'a_gpu_brand', 'a_gpu_serial', 'a_ups_brand', 'a_ups_serial', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 2, 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', NULL, NULL, NULL, NULL, NULL, NULL),
(6, 6, '', '', '', '', '', '', '', '', '', '', 'c', 'c', '', '', '', ''),
(7, 7, '', '', '', '', '', '', '', '', '', '', '', '', 'd', 'd', 'd', 'd'),
(8, 8, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''),
(9, 9, 'e_mother_brand', 'e_mother_serial', 'e_proc_brand', 'e_proc_serial', 'e_mon_br', 'e_mon_ser', 'e_gpu_brand', 'e_gpu_brand', 'e_ups', 'e_ups_ser', '', '', '', '', '', '');

-- --------------------------------------------------------

--
-- Table structure for table `device_memory`
--

CREATE TABLE `device_memory` (
  `id` int(11) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `type` enum('RAM','HDD','SSD') DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `serial` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `device_memory`
--

INSERT INTO `device_memory` (`id`, `device_id`, `type`, `brand`, `serial`) VALUES
(1, 1, 'RAM', 'a', 'a'),
(2, 1, 'HDD', 'a', 'a'),
(3, 1, 'SSD', 'a', 'a'),
(4, 2, 'RAM', 'b', 'b'),
(5, 2, 'HDD', 'b', 'b'),
(6, 2, 'SSD', 'b', 'b'),
(7, 9, 'RAM', 'e_mem_1_br', 'e_mem_1_ser'),
(8, 9, 'RAM', 'e_mem_2_br', 'e_mem_2_ser'),
(9, 9, 'HDD', 'e_hdd_brand', 'e_hdd_ser'),
(10, 9, 'SSD', 'e_ssd_brand', 'e_ssd_ser');

-- --------------------------------------------------------

--
-- Table structure for table `device_network`
--

CREATE TABLE `device_network` (
  `id` int(11) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `mac_address` varchar(50) DEFAULT NULL,
  `internet_access` varchar(50) DEFAULT NULL,
  `connection_type` varchar(50) DEFAULT NULL,
  `internet_permission` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `device_network`
--

INSERT INTO `device_network` (`id`, `device_id`, `ip_address`, `mac_address`, `internet_access`, `connection_type`, `internet_permission`) VALUES
(1, 1, 'a', 'a', 'With Internet', 'Wired', 'Basic Connect'),
(2, 2, 'b', 'b', 'With Internet', 'Wired', 'Basic Connect'),
(6, 6, '', '', '', '', ''),
(7, 7, '', '', '', '', ''),
(8, 8, '', '', '', '', ''),
(9, 9, '192.189.2.10', 'AA:BB:DD:CC', 'With Internet', 'Wired', 'Basic Connect');

-- --------------------------------------------------------

--
-- Table structure for table `device_software`
--

CREATE TABLE `device_software` (
  `id` int(11) NOT NULL,
  `device_id` int(11) DEFAULT NULL,
  `computer_name` varchar(255) DEFAULT NULL,
  `operating_system` varchar(255) DEFAULT NULL,
  `os_license_key` varchar(255) DEFAULT NULL,
  `productivity_suite` varchar(255) DEFAULT NULL,
  `productivity_license_key` varchar(255) DEFAULT NULL,
  `endpoint_protection` varchar(255) DEFAULT NULL,
  `bitlocker_key` varchar(255) DEFAULT NULL,
  `device_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `device_software`
--

INSERT INTO `device_software` (`id`, `device_id`, `computer_name`, `operating_system`, `os_license_key`, `productivity_suite`, `productivity_license_key`, `endpoint_protection`, `bitlocker_key`, `device_name`) VALUES
(1, 1, 'a', 'a', 'a', 'a', 'a', 'a', 'a', ''),
(2, 2, 'b', 'b', 'b', 'b', 'b', 'b', 'b', ''),
(6, 6, '', '', '', '', '', '', '', 'c'),
(7, 7, '', '', '', '', '', '', '', ''),
(8, 8, '', '', '', '', '', '', '', ''),
(9, 9, 'e_comp_name', 'windows 10 pro', 'windows os key', 'e productivity', 'e prod license', 'e endpoint', 'e bit lock', '');

-- --------------------------------------------------------

--
-- Table structure for table `divisions`
--

CREATE TABLE `divisions` (
  `division_id` int(11) NOT NULL,
  `division_name` varchar(255) NOT NULL,
  `office_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `divisions`
--

INSERT INTO `divisions` (`division_id`, `division_name`, `office_id`) VALUES
(3, 'IT Repair & Maintenance', 3),
(26, 'NO DIVISION', 2),
(27, 'NO DIVISION', 6),
(28, 'No Division', 7),
(35, 'Web Dev & Design', 3),
(38, 'System Development', 3);

-- --------------------------------------------------------

--
-- Table structure for table `itrm_service_report`
--

CREATE TABLE `itrm_service_report` (
  `id` int(11) NOT NULL,
  `control_no` varchar(255) DEFAULT NULL,
  `date_of_request` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) DEFAULT NULL,
  `dept_head` varchar(255) DEFAULT NULL,
  `contact_no` varchar(255) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `issue_request` text DEFAULT NULL,
  `personnel_id` int(11) DEFAULT NULL,
  `requestDiv_Id` int(11) NOT NULL,
  `approval_status` tinyint(1) DEFAULT 0 COMMENT '0 = unapproved, 1 = approved',
  `accept` tinyint(1) DEFAULT 0,
  `property_no` varchar(255) DEFAULT NULL,
  `services` varchar(255) DEFAULT NULL,
  `service_level_id` varchar(255) DEFAULT NULL,
  `service_quantity_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `datetime_accomplished` datetime DEFAULT NULL,
  `date_released` datetime DEFAULT NULL,
  `released` tinyint(1) DEFAULT NULL,
  `released_to` varchar(255) DEFAULT NULL,
  `signature` text DEFAULT NULL,
  `request_status` varchar(255) NOT NULL DEFAULT 'Pending',
  `task_duration` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `approval_datetime` datetime DEFAULT NULL,
  `time_accepted` datetime DEFAULT NULL,
  `time_assigned` datetime DEFAULT NULL,
  `process_time` time DEFAULT NULL,
  `datetime_noted_by` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `itrm_service_report`
--

INSERT INTO `itrm_service_report` (`id`, `control_no`, `date_of_request`, `name`, `dept_head`, `contact_no`, `office_id`, `division_id`, `issue_request`, `personnel_id`, `requestDiv_Id`, `approval_status`, `accept`, `property_no`, `services`, `service_level_id`, `service_quantity_id`, `action_taken`, `remarks`, `date_started`, `datetime_accomplished`, `date_released`, `released`, `released_to`, `signature`, `request_status`, `task_duration`, `start_time`, `end_time`, `approval_datetime`, `time_accepted`, `time_assigned`, `process_time`, `datetime_noted_by`) VALUES
(169, 'ITRM-2026-0001', '2026-03-30 05:19:33', 'John Doe', 'Mike Lontok', '09194567892', 2, 26, 'No power.', 1, 1, 1, 1, '1234/5678', '[1]', '{\"1\":\"\"}', '{\"1\":1}', 'Checked power cable and outlet. reconnected cables and tried turning it on again. issue still persists.', 'Pc has no power. unit not turning on.', '2026-03-30 13:21:35', '2026-03-30 13:21:00', '2026-03-30 13:24:00', 1, 'John Doe', 'data:image/png;base64,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', 'Released', '00:00:23', '13:21:35', '13:21:58', '2026-03-30 13:20:00', '2026-03-30 13:20:14', '2026-03-30 13:20:14', '00:00:00', NULL),
(170, 'ITRM-2026-0002', '2026-04-20 01:53:20', 'Gregg Felicisimo', 'Khent Rago', '09182348529', 3, 3, 'Sample request.', 18724, 1, 1, 1, '0923/3242', '[1,4]', '{\"1\":\"\",\"4\":\"LC\"}', '{\"1\":1,\"4\":1}', 'At.', 'Rem.', '2026-04-20 09:54:17', '2026-04-22 08:43:00', '2026-04-22 08:44:00', 1, 'Gregg Felicisimo', 'data:image/png;base64,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', 'Released', NULL, '09:54:17', '08:44:05', '2026-04-20 09:53:33', '2026-04-20 09:53:48', '2026-04-20 09:53:48', '14:48:43', NULL),
(171, 'ITRM-2026-0003', '2026-04-29 02:34:42', 'Alex Enciso', 'Khent Rago', '09192837428', 3, 3, 'Bosd.', 18724, 1, 1, 1, '1235/9324', '[1,7]', '{\"1\":\"\",\"7\":\"Simple\"}', '{\"1\":1,\"7\":1}', 'Ram for replacement.', 'Broken ram.', '2026-05-07 10:46:05', '2026-05-07 10:46:00', '2026-05-13 08:38:00', 1, 'Alex Enciso', 'data:image/png;base64,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', 'Released', '00:00:34', '10:46:05', '10:46:39', '2026-05-07 10:45:36', '2026-05-07 10:45:48', '2026-05-07 10:45:48', '00:00:00', NULL),
(173, NULL, '2026-04-29 05:12:44', '1', '', '1', 3, 3, '1.', NULL, 1, 0, 0, '1', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(174, NULL, '2026-04-29 05:12:55', '2', '', '2', 3, 3, '2.', NULL, 1, 0, 0, '2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(175, NULL, '2026-04-29 05:13:07', '3', '', '3', 3, 3, '3.', NULL, 1, 0, 0, '3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(176, NULL, '2026-04-29 05:13:18', '4', '', '4', 3, 3, '4.', NULL, 1, 0, 0, '4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(177, NULL, '2026-04-29 05:13:30', '5', '', '5', 3, 3, '5.', NULL, 1, 0, 0, '5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(178, NULL, '2026-04-29 05:13:43', '6', '', '6', 3, 3, '6.', NULL, 1, 0, 0, '6', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(179, NULL, '2026-04-29 05:13:54', '7', '', '7', 3, 3, '7.', NULL, 1, 0, 0, '7', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(180, NULL, '2026-04-29 05:14:46', '8', '', '8', 3, 3, '8.', NULL, 1, 0, 0, '8', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(181, NULL, '2026-04-29 05:14:58', '9', '', '9', 3, 3, '9.', NULL, 1, 0, 0, '9', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(182, NULL, '2026-04-29 05:15:15', '10', '', '10', 3, 3, '10.', NULL, 1, 0, 0, '10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `it_equipment`
--

CREATE TABLE `it_equipment` (
  `id` int(11) NOT NULL,
  `accountable_person` varchar(255) DEFAULT NULL,
  `end_user` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `brand_type` varchar(50) DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `model` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `par_ics` varchar(100) DEFAULT NULL,
  `computer_name` varchar(255) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `it_equipment`
--

INSERT INTO `it_equipment` (`id`, `accountable_person`, `end_user`, `designation`, `brand_type`, `brand`, `model`, `serial_number`, `par_ics`, `computer_name`, `office_id`, `division_id`, `status`, `created_at`) VALUES
(1, 'a', 'a_end_user', 'a_designation', 'Clone', NULL, NULL, NULL, 'a_property', 'a_computer_name', 2, 26, 'Servicable', '2026-05-06 01:55:24'),
(2, 'b', 'b', 'b', 'Branded', 'b', 'b', 'b', 'b', 'b', 3, 3, 'Servicable', '2026-05-06 02:22:05'),
(6, 'c', 'c', 'c', 'Branded', 'c', 'c', 'c', 'c', 'c', 3, 3, 'Servicable', '2026-05-07 06:01:39'),
(7, 'd', 'd', 'd', 'Clone', NULL, NULL, NULL, 'd', 'd', 7, 28, 'Servicable', '2026-05-07 06:02:23'),
(8, 'Leney C. Laygo', '', 'PGADH', 'Clone', NULL, NULL, NULL, '', 'PICTO045', 3, 0, '', '2026-05-12 02:56:22'),
(9, 'e', 'e_user', 'e_design', 'Branded', 'e_dell', 'e_model', 'e_serial', 'e_property', 'e_computer_name', 6, 27, 'Servicable', '2026-05-20 02:47:46');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_checklist_logs`
--

CREATE TABLE `maintenance_checklist_logs` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) DEFAULT NULL,
  `device_name` varchar(255) DEFAULT NULL,
  `accountable_person` varchar(255) DEFAULT NULL,
  `par_ics` varchar(255) DEFAULT NULL,
  `equipment_type` varchar(100) DEFAULT NULL,
  `template_id` int(11) NOT NULL,
  `findings` text DEFAULT NULL,
  `recommendation` text DEFAULT NULL,
  `signature` longtext DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `verified_by` varchar(255) DEFAULT NULL,
  `noted_by` varchar(255) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `noted_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `maintenance_checklist_logs`
--

INSERT INTO `maintenance_checklist_logs` (`id`, `equipment_id`, `device_name`, `accountable_person`, `par_ics`, `equipment_type`, `template_id`, `findings`, `recommendation`, `signature`, `approved_by`, `verified_by`, `noted_by`, `approved_at`, `verified_at`, `noted_at`, `created_by`, `created_at`) VALUES
(16, 2, 'b', 'b', 'b', 'Desktop/Laptop', 1, 'Brief findings/remarks description.', 'Brief recommendation description', 'data:image/png;base64,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', 'Khent Rago', 'Khent Rago', 'Len', NULL, NULL, NULL, 0, '2026-05-14 01:43:50'),
(17, 1, 'a_computer_name', 'a', 'a_property', 'Desktop/Laptop', 1, 'a_findings', 'a_recommendation', 'data:image/png;base64,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', 'Khent Rago', 'Noel Nonato A. Antonio', 'Leney C. Laygo', NULL, NULL, NULL, 0, '2026-05-17 22:55:59'),
(18, 7, 'd_computer_name', 'd', 'd_property', 'Network Switch', 3, 'd_findings', 'd_recommendation', 'data:image/png;base64,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', 'Khent Rago', 'Noel Nonato A. Antonio', 'Leney C. Laygo', NULL, NULL, NULL, 0, '2026-05-19 18:06:17'),
(19, 9, 'e_computer_name', 'e', 'e_property', 'Desktop/Laptop', 1, 'e_findings', 'e_reco', 'data:image/png;base64,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', 'Khent Rago', 'Noel Nonato A. Antonio', 'Leney C. Laygo', NULL, NULL, NULL, 0, '2026-05-19 19:49:44');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_checklist_log_tasks`
--

CREATE TABLE `maintenance_checklist_log_tasks` (
  `id` int(11) NOT NULL,
  `checklist_log_id` int(11) NOT NULL,
  `checklist_task_id` int(11) NOT NULL,
  `is_done` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `maintenance_checklist_log_tasks`
--

INSERT INTO `maintenance_checklist_log_tasks` (`id`, `checklist_log_id`, `checklist_task_id`, `is_done`) VALUES
(160, 16, 14, 0),
(161, 16, 15, 0),
(162, 16, 16, 0),
(163, 16, 17, 0),
(164, 16, 18, 0),
(165, 16, 19, 0),
(166, 16, 20, 0),
(167, 16, 21, 0),
(168, 16, 22, 0),
(169, 16, 23, 0),
(170, 16, 24, 0),
(171, 16, 25, 0),
(172, 16, 26, 0),
(173, 16, 27, 0),
(174, 17, 14, 1),
(175, 17, 15, 1),
(176, 17, 16, 1),
(177, 17, 17, 1),
(178, 17, 18, 1),
(179, 17, 19, 1),
(180, 17, 20, 0),
(181, 17, 21, 0),
(182, 17, 22, 0),
(183, 17, 23, 1),
(184, 17, 24, 1),
(185, 17, 25, 1),
(186, 17, 26, 1),
(187, 17, 27, 1),
(188, 18, 35, 1),
(189, 18, 36, 1),
(190, 18, 37, 1),
(191, 18, 38, 1),
(192, 18, 39, 1),
(193, 18, 40, 0),
(194, 18, 41, 0),
(195, 19, 14, 1),
(196, 19, 15, 1),
(197, 19, 16, 1),
(198, 19, 17, 0),
(199, 19, 18, 0),
(200, 19, 19, 0),
(201, 19, 20, 0),
(202, 19, 21, 0),
(203, 19, 22, 0),
(204, 19, 23, 0),
(205, 19, 24, 0),
(206, 19, 25, 0),
(207, 19, 26, 0),
(208, 19, 27, 0);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_checklist_tasks`
--

CREATE TABLE `maintenance_checklist_tasks` (
  `id` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `task_order` int(11) NOT NULL,
  `task_description` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `maintenance_checklist_tasks`
--

INSERT INTO `maintenance_checklist_tasks` (`id`, `template_id`, `task_order`, `task_description`, `is_active`) VALUES
(14, 1, 1, 'Create PICTO account', 1),
(15, 1, 2, 'Change computer name according to Dept. ID & Property # (e.g. Acctg-12345)', 1),
(16, 1, 3, 'Run Windows System Information for Windows', 1),
(17, 1, 4, 'Set official PGQ wallpaper', 1),
(18, 1, 5, 'Install essential applications and uninstall unnecessary programs to optimize startup performance', 1),
(19, 1, 6, 'Check for any changes in specification and update Hardware/Software/Network Information', 1),
(20, 1, 7, 'Check health status of HDD or SSD', 1),
(21, 1, 8, 'Check if CMOS battery needs replacing', 1),
(22, 1, 9, 'Check CPU temperature', 1),
(23, 1, 10, 'Clean the exterior/interior part of the system unit, replace damaged cables', 1),
(24, 1, 11, 'Check connection to printer and network/internet access', 1),
(25, 1, 12, 'Check printer connection', 1),
(26, 1, 13, 'Affix/Update Maintenance Sticker', 1),
(27, 1, 14, 'Update Maintenance Monitoring Log', 1),
(28, 2, 1, 'Clean the exterior/interior part of the cabinet', 1),
(29, 2, 2, 'Inspect the frame for physical damage, rust, or loose bolts.', 1),
(30, 2, 3, 'Inspect power cords for fraying, pinching, or heat damage.', 1),
(31, 2, 4, 'Update or replace any missing labels on cables.', 1),
(32, 2, 5, 'Ensure doors open, close, and lock properly.', 1),
(33, 2, 6, 'Affix/Update Maintenance Sticker.', 1),
(34, 2, 7, 'Create/Update Maintenance Monitoring Log.', 1),
(35, 3, 1, 'Power off and unplug Network Switch before cleaning.', 1),
(36, 3, 2, 'Lightly dampen the microfiber cloth with 70% Isopropyl Alcohol before using on the metal or plastic chassis.', 1),
(37, 3, 3, 'Clean unused ports and vents with compressed air.', 1),
(38, 3, 4, 'Check for loose connections and replace defective connectors.', 1),
(39, 3, 5, 'Verify connectivity after maintenance.', 1),
(40, 3, 6, 'Affix/Update Maintenance Sticker.', 1),
(41, 3, 7, 'Create/Update Maintenance Monitoring Log.', 1),
(42, 4, 1, 'Clean the exterior/interior part of the printer.', 1),
(43, 4, 2, 'Print test page.', 1),
(44, 4, 3, 'Perform nozzle check and head cleaning if necessary.', 1),
(45, 4, 4, 'Affix/Update Maintenance Sticker.', 1),
(46, 4, 5, 'Update Maintenance Monitoring Log.', 1),
(52, 8, 1, '1', 1),
(53, 8, 2, '2', 1),
(54, 8, 3, '3', 1),
(55, 8, 4, '4', 1);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_checklist_templates`
--

CREATE TABLE `maintenance_checklist_templates` (
  `id` int(11) NOT NULL,
  `equipment_type` varchar(100) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `version_year` year(4) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `maintenance_checklist_templates`
--

INSERT INTO `maintenance_checklist_templates` (`id`, `equipment_type`, `template_name`, `version_year`, `is_active`, `created_at`) VALUES
(1, 'Desktop/Laptop', 'Desktop and Laptop Preventive Maintenance Checklist', 2026, 1, '2026-05-07 06:16:33'),
(2, 'Data Cabinet', 'Data Cabinet Preventive Maintenance Checklist', 2026, 1, '2026-05-07 06:35:37'),
(3, 'Network Switch', 'Network Switch Preventive Maintenance Checklist', 2026, 1, '2026-05-07 06:36:08'),
(4, 'Printer', 'Printer Preventive Maintenance Checklist', 2026, 1, '2026-05-07 06:36:18'),
(8, 'desktropp', 'sample', 2026, 1, '2026-05-12 19:00:40');

-- --------------------------------------------------------

--
-- Table structure for table `office`
--

CREATE TABLE `office` (
  `office_id` int(11) NOT NULL,
  `office_name` varchar(255) NOT NULL,
  `office_value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `office`
--

INSERT INTO `office` (`office_id`, `office_name`, `office_value`) VALUES
(2, 'Provincial Accountant Office', 'Accounting'),
(3, 'Provincial Information And Communications Technology Office', 'Picto'),
(6, 'Provincial Treasurer Office', 'Pto'),
(7, 'Office Of The Provincial Assesor', 'Assessor');

-- --------------------------------------------------------

--
-- Table structure for table `personnels`
--

CREATE TABLE `personnels` (
  `personnel_id` int(11) NOT NULL,
  `personnel_name` varchar(255) NOT NULL,
  `division_id` int(11) DEFAULT NULL,
  `division_name` varchar(255) DEFAULT NULL,
  `signature_path` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `personnels`
--

INSERT INTO `personnels` (`personnel_id`, `personnel_name`, `division_id`, `division_name`, `signature_path`, `position`) VALUES
(1, 'Noel Nonato A. Antonio', 3, 'It Repair & Maintenance', NULL, NULL),
(123, 'One Two Three', 3, 'It Repair & Maintenance', NULL, NULL),
(18724, 'Khent Rago', 3, 'It Repair & Maintenance', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `request_division`
--

CREATE TABLE `request_division` (
  `requestDiv_Id` int(11) NOT NULL,
  `requestDiv_Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `request_division`
--

INSERT INTO `request_division` (`requestDiv_Id`, `requestDiv_Name`) VALUES
(1, 'IT & Repair Maintenance'),
(2, 'System Support'),
(3, 'Creative Works');

-- --------------------------------------------------------

--
-- Table structure for table `sysdev_service_report`
--

CREATE TABLE `sysdev_service_report` (
  `id` int(11) NOT NULL,
  `control_no` varchar(255) DEFAULT NULL,
  `date_of_request` timestamp NOT NULL DEFAULT current_timestamp(),
  `name` varchar(255) DEFAULT NULL,
  `dept_head` varchar(255) DEFAULT NULL,
  `contact_no` varchar(255) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `issue_request` text DEFAULT NULL,
  `personnel_id` int(11) DEFAULT NULL,
  `requestDiv_Id` int(11) NOT NULL,
  `approval_status` tinyint(1) DEFAULT 0 COMMENT '0 = unapproved, 1 = approved',
  `accept` tinyint(1) DEFAULT 0,
  `property_no` varchar(255) DEFAULT NULL,
  `services` varchar(255) DEFAULT NULL,
  `service_level_id` varchar(255) DEFAULT NULL,
  `service_quantity_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `action_taken` text DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `datetime_accomplished` datetime DEFAULT NULL,
  `date_released` datetime DEFAULT NULL,
  `released` tinyint(1) DEFAULT NULL,
  `released_to` varchar(255) DEFAULT NULL,
  `signature` text DEFAULT NULL,
  `request_status` varchar(255) NOT NULL DEFAULT 'Pending',
  `task_duration` varchar(50) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `approval_datetime` datetime DEFAULT NULL,
  `time_accepted` datetime DEFAULT NULL,
  `time_assigned` datetime DEFAULT NULL,
  `process_time` time DEFAULT NULL,
  `datetime_noted_by` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `sysdev_service_report`
--

INSERT INTO `sysdev_service_report` (`id`, `control_no`, `date_of_request`, `name`, `dept_head`, `contact_no`, `office_id`, `division_id`, `issue_request`, `personnel_id`, `requestDiv_Id`, `approval_status`, `accept`, `property_no`, `services`, `service_level_id`, `service_quantity_id`, `action_taken`, `remarks`, `date_started`, `datetime_accomplished`, `date_released`, `released`, `released_to`, `signature`, `request_status`, `task_duration`, `start_time`, `end_time`, `approval_datetime`, `time_accepted`, `time_assigned`, `process_time`, `datetime_noted_by`) VALUES
(1, NULL, '2026-04-20 02:20:31', 'Sayrus', '', '09192837428', 3, 3, 'System sups.', NULL, 2, 0, 0, '2329/32432', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Our technical staff will assist you as soon as they become available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_number` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `office_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `designation` varchar(100) NOT NULL,
  `permissions` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `islocked` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_number`, `name`, `password`, `office_id`, `division_id`, `designation`, `permissions`, `isActive`, `islocked`) VALUES
(1, 'Noel Nonato A. Antonio', '$2y$10$UUJNcUtUTWk3RS9zTTVvYeUhdeoO/TJhYfiCFftz4Nzl6oz0IW9LS', 3, 3, 'Administrative Aide VI', '[\"1.1\",\"1.2\",\"3.4\",\"5.4\",\"5.5\",\"5.1\",\"5.6\",\"5.2\",\"3.5\"]', 1, 0),
(123, 'Mike Lontok', '$2y$10$UWRIaW0ycXAwSkUzZ3NWc.hgbuo9K0qWsOlPbrlpKRG5TOx7pQHXi', 2, 26, 'Administrative Aide Iii', '[\"1.2\",\"1.1\",\"5.2\"]', 1, 0),
(18724, 'Khent Rago', '$2y$10$Yk1SUk1RVzlVSmN1NVhZYOJXKj/XcvGIYJ65ylYNDl19L/1e80mdC', 3, 3, 'Administrative Aide VI', '[\"1.1\",\"1.2\",\"2.1\",\"2.2\",\"2.3\",\"2.4\",\"2.5\",\"2.6\",\"2.7\",\"2.8\",\"2.9\",\"3.1\",\"3.2\",\"3.3\",\"3.4\",\"5.4\",\"5.5\",\"4.1\",\"5.1\",\"5.6\",\"5.2\",\"5.3\",\"3.5\",\"4.2\",\"4.3\"]', 1, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `device_equipment_types`
--
ALTER TABLE `device_equipment_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `device_hardware`
--
ALTER TABLE `device_hardware`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `device_memory`
--
ALTER TABLE `device_memory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`),
  ADD KEY `idx_memory_type` (`type`);

--
-- Indexes for table `device_network`
--
ALTER TABLE `device_network`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `device_software`
--
ALTER TABLE `device_software`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_id` (`device_id`);

--
-- Indexes for table `divisions`
--
ALTER TABLE `divisions`
  ADD PRIMARY KEY (`division_id`),
  ADD KEY `office_id` (`office_id`);

--
-- Indexes for table `itrm_service_report`
--
ALTER TABLE `itrm_service_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personnel_id` (`personnel_id`),
  ADD KEY `fk_office_id` (`office_id`),
  ADD KEY `fk_itsr_division_id` (`requestDiv_Id`),
  ADD KEY `fk_services` (`services`),
  ADD KEY `services` (`services`),
  ADD KEY `fk_service_level` (`service_level_id`),
  ADD KEY `fk_itrm_service_report_division` (`division_id`);

--
-- Indexes for table `it_equipment`
--
ALTER TABLE `it_equipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_equipment_office` (`office_id`),
  ADD KEY `idx_equipment_division` (`division_id`);

--
-- Indexes for table `maintenance_checklist_logs`
--
ALTER TABLE `maintenance_checklist_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `maintenance_checklist_log_tasks`
--
ALTER TABLE `maintenance_checklist_log_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `checklist_log_id` (`checklist_log_id`),
  ADD KEY `checklist_task_id` (`checklist_task_id`);

--
-- Indexes for table `maintenance_checklist_tasks`
--
ALTER TABLE `maintenance_checklist_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `maintenance_checklist_templates`
--
ALTER TABLE `maintenance_checklist_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `office`
--
ALTER TABLE `office`
  ADD PRIMARY KEY (`office_id`);

--
-- Indexes for table `personnels`
--
ALTER TABLE `personnels`
  ADD PRIMARY KEY (`personnel_id`),
  ADD KEY `division_id` (`division_id`);

--
-- Indexes for table `request_division`
--
ALTER TABLE `request_division`
  ADD PRIMARY KEY (`requestDiv_Id`);

--
-- Indexes for table `sysdev_service_report`
--
ALTER TABLE `sysdev_service_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_personnel_id` (`personnel_id`),
  ADD KEY `fk_office_id` (`office_id`),
  ADD KEY `fk_itsr_division_id` (`requestDiv_Id`),
  ADD KEY `fk_services` (`services`),
  ADD KEY `services` (`services`),
  ADD KEY `fk_service_level` (`service_level_id`),
  ADD KEY `fk_itrm_service_report_division` (`division_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_number`),
  ADD KEY `fk_users_office` (`office_id`),
  ADD KEY `fk_division_id` (`division_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `device_equipment_types`
--
ALTER TABLE `device_equipment_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `device_hardware`
--
ALTER TABLE `device_hardware`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `device_memory`
--
ALTER TABLE `device_memory`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `device_network`
--
ALTER TABLE `device_network`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `device_software`
--
ALTER TABLE `device_software`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `itrm_service_report`
--
ALTER TABLE `itrm_service_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=183;

--
-- AUTO_INCREMENT for table `it_equipment`
--
ALTER TABLE `it_equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `maintenance_checklist_logs`
--
ALTER TABLE `maintenance_checklist_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `maintenance_checklist_log_tasks`
--
ALTER TABLE `maintenance_checklist_log_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT for table `maintenance_checklist_tasks`
--
ALTER TABLE `maintenance_checklist_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `maintenance_checklist_templates`
--
ALTER TABLE `maintenance_checklist_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `office`
--
ALTER TABLE `office`
  MODIFY `office_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `personnels`
--
ALTER TABLE `personnels`
  MODIFY `personnel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18725;

--
-- AUTO_INCREMENT for table `request_division`
--
ALTER TABLE `request_division`
  MODIFY `requestDiv_Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sysdev_service_report`
--
ALTER TABLE `sysdev_service_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `device_equipment_types`
--
ALTER TABLE `device_equipment_types`
  ADD CONSTRAINT `device_equipment_types_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `it_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `device_hardware`
--
ALTER TABLE `device_hardware`
  ADD CONSTRAINT `device_hardware_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `it_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `device_memory`
--
ALTER TABLE `device_memory`
  ADD CONSTRAINT `device_memory_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `it_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `device_network`
--
ALTER TABLE `device_network`
  ADD CONSTRAINT `device_network_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `it_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `device_software`
--
ALTER TABLE `device_software`
  ADD CONSTRAINT `device_software_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `it_equipment` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `divisions`
--
ALTER TABLE `divisions`
  ADD CONSTRAINT `divisions_ibfk_1` FOREIGN KEY (`office_id`) REFERENCES `office` (`office_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `itrm_service_report`
--
ALTER TABLE `itrm_service_report`
  ADD CONSTRAINT `fk_itrm_service_report_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`division_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_itrm_service_report_office` FOREIGN KEY (`office_id`) REFERENCES `office` (`office_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_itrm_service_report_request_division` FOREIGN KEY (`requestDiv_Id`) REFERENCES `request_division` (`requestDiv_Id`),
  ADD CONSTRAINT `fk_personnel_id` FOREIGN KEY (`personnel_id`) REFERENCES `users` (`id_number`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `maintenance_checklist_logs`
--
ALTER TABLE `maintenance_checklist_logs`
  ADD CONSTRAINT `maintenance_checklist_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `maintenance_checklist_templates` (`id`);

--
-- Constraints for table `maintenance_checklist_log_tasks`
--
ALTER TABLE `maintenance_checklist_log_tasks`
  ADD CONSTRAINT `maintenance_checklist_log_tasks_ibfk_1` FOREIGN KEY (`checklist_log_id`) REFERENCES `maintenance_checklist_logs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `maintenance_checklist_log_tasks_ibfk_2` FOREIGN KEY (`checklist_task_id`) REFERENCES `maintenance_checklist_tasks` (`id`);

--
-- Constraints for table `maintenance_checklist_tasks`
--
ALTER TABLE `maintenance_checklist_tasks`
  ADD CONSTRAINT `maintenance_checklist_tasks_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `maintenance_checklist_templates` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `personnels`
--
ALTER TABLE `personnels`
  ADD CONSTRAINT `fk_personnels_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`division_id`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`division_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_office` FOREIGN KEY (`office_id`) REFERENCES `office` (`office_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
