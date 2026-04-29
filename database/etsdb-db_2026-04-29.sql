-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 29, 2026 at 03:11 AM
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
(170, 'ITRM-2026-0002', '2026-04-20 01:53:20', 'Gregg Felicisimo', 'Khent Rago', '09182348529', 3, 3, 'Sample request.', 18724, 1, 1, 1, '0923/3242', '[1,4]', '{\"1\":\"\",\"4\":\"LC\"}', '{\"1\":1,\"4\":1}', 'At.', 'Rem.', '2026-04-20 09:54:17', '2026-04-22 08:43:00', '2026-04-22 08:44:00', 1, 'Gregg Felicisimo', 'data:image/png;base64,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', 'Released', NULL, '09:54:17', '08:44:05', '2026-04-20 09:53:33', '2026-04-20 09:53:48', '2026-04-20 09:53:48', '14:48:43', NULL);

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
  `division_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `personnels`
--

INSERT INTO `personnels` (`personnel_id`, `personnel_name`, `division_id`, `division_name`) VALUES
(1, 'Noel Nonato A. Antonio', 3, 'It Repair & Maintenance'),
(123, 'One Two Three', 3, 'It Repair & Maintenance'),
(18724, 'Khent Rago', 3, 'It Repair & Maintenance');

-- --------------------------------------------------------

--
-- Table structure for table `preventive_maintenance`
--

CREATE TABLE `preventive_maintenance` (
  `id` int(11) NOT NULL,
  `accountable_person` varchar(255) DEFAULT NULL,
  `end_user` varchar(255) DEFAULT NULL,
  `designation` longtext DEFAULT NULL,
  `equipment_type` longtext DEFAULT NULL,
  `par_ics` varchar(255) DEFAULT NULL,
  `computer_name` varchar(255) DEFAULT NULL,
  `office_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `status` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `hardware_information` longtext DEFAULT NULL,
  `software_information` longtext DEFAULT NULL,
  `network_information` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `preventive_maintenance`
--

INSERT INTO `preventive_maintenance` (`id`, `accountable_person`, `end_user`, `designation`, `equipment_type`, `par_ics`, `computer_name`, `office_id`, `division_id`, `status`, `created_at`, `updated_at`, `hardware_information`, `software_information`, `network_information`) VALUES
(12, 'b', 'b', '\"AA IV\"', '[\"Desktop\",\"Printer\"]', '123456/7890', 'BA', 6, 27, '\"Servicable\"', '2025-07-16 01:25:18', '2025-08-01 08:06:32', '{\"motherboard\":{\"brand\":\"b\",\"serial\":\"b\"},\"processor\":{\"brand\":\"b\",\"serial\":\"b\"},\"memory1\":{\"brand\":\"b\",\"serial\":\"b\"},\"memory2\":{\"brand\":\"b\",\"serial\":\"b\"},\"hdd\":{\"brand\":\"b\",\"serial\":\"b\"},\"ssd\":{\"brand\":\"b\",\"serial\":\"b\"},\"monitor\":{\"brand\":\"b\",\"serial\":\"b\"},\"gpu\":{\"brand\":\"\",\"serial\":\"\"},\"ups\":{\"brand\":\"b\",\"serial\":\"b\"}}', '{\"operatingSystem\":\"b\",\"productivitySuite\":\"b\",\"systemInstalled\":\"b\"}', '{\"ipAddress\":\"b\",\"macAddress\":\"b\",\"withInternet\":true,\"withoutInternet\":false,\"wireless\":false,\"wired\":true}'),
(13, 'a', 'a', '\"a\"', '[\"Desktop\"]', '123456/7890', 'aH', 7, 28, '\"Servicable\"', '2025-07-16 01:45:22', '2025-08-01 08:06:35', '{\"motherboard\":{\"brand\":\"a\",\"serial\":\"a\"},\"processor\":{\"brand\":\"a\",\"serial\":\"a\"},\"memory1\":{\"brand\":\"a\",\"serial\":\"a\"},\"memory2\":{\"brand\":\"a\",\"serial\":\"a\"},\"hdd\":{\"brand\":\"a\",\"serial\":\"a\"},\"ssd\":{\"brand\":\"a\",\"serial\":\"a\"},\"monitor\":{\"brand\":\"a\",\"serial\":\"a\"},\"gpu\":{\"brand\":\"\",\"serial\":\"\"},\"ups\":{\"brand\":\"a\",\"serial\":\"a\"}}', '{\"operatingSystem\":\"a\",\"productivitySuite\":\"a\",\"systemInstalled\":\"a\"}', '{\"ipAddress\":\"a\",\"macAddress\":\"a\",\"withInternet\":true,\"withoutInternet\":false,\"wireless\":false,\"wired\":true}'),
(14, 'd', 'd', '\"d\"', '[\"UPS\"]', '123456/7890', 'dA', 7, 28, '\"Unservicable\"', '2025-07-22 08:18:49', '2025-08-01 08:06:37', '{\"motherboard\":{\"brand\":\"\",\"serial\":\"\"},\"processor\":{\"brand\":\"\",\"serial\":\"\"},\"memory1\":{\"brand\":\"\",\"serial\":\"\"},\"memory2\":{\"brand\":\"\",\"serial\":\"\"},\"hdd\":{\"brand\":\"\",\"serial\":\"\"},\"ssd\":{\"brand\":\"\",\"serial\":\"\"},\"monitor\":{\"brand\":\"\",\"serial\":\"\"},\"gpu\":{\"brand\":\"\",\"serial\":\"\"},\"ups\":{\"brand\":\"d\",\"serial\":\"d\"}}', '{\"operatingSystem\":\"\",\"productivitySuite\":\"\",\"systemInstalled\":\"\"}', '{\"ipAddress\":\"\",\"macAddress\":\"\",\"withInternet\":false,\"withoutInternet\":false,\"wireless\":false,\"wired\":false}'),
(15, 'John Doe', 'John Doe', '\"Administrative Aide VI\"', '[\"Desktop\"]', '101112/131415', 'SMP-0001', 6, 27, '\"Servicable\"', '2025-08-04 01:26:06', '2025-08-04 01:26:06', '{\"motherboard\":{\"brand\":\"Asus Prime B450M\",\"serial\":\"123456\"},\"processor\":{\"brand\":\"Ryzen 3 3200g\",\"serial\":\"123456\"},\"memory1\":{\"brand\":\"Adata 8 gb 3200mhz\",\"serial\":\"123456\"},\"memory2\":{\"brand\":\"\",\"serial\":\"\"},\"hdd\":{\"brand\":\"Seagate Ironwolf 3.5 \",\"serial\":\"123456\"},\"ssd\":{\"brand\":\"Kingston NV3 NVMe Pcie 4.0\",\"serial\":\"123456\"},\"monitor\":{\"brand\":\"AOC\",\"serial\":\"123456\"},\"gpu\":{\"brand\":\"\",\"serial\":\"\"},\"ups\":{\"brand\":\"APC\",\"serial\":\"123456\"}}', '{\"operatingSystem\":\"Windows 11 Pro\",\"productivitySuite\":\"Microsoft Office 2021\",\"systemInstalled\":\"Antivirus\"}', '{\"ipAddress\":\"192.168.10.73\",\"macAddress\":\"AA:BB:CC:DD:EE\",\"withInternet\":true,\"withoutInternet\":false,\"wireless\":false,\"wired\":true}'),
(17, 'c', 'c', '\"c\"', '[\"Laptop\"]', 'c', 'c', 2, 26, '\"Servicable\"', '2026-01-16 00:00:15', '2026-01-16 00:00:15', '{\"motherboard\":{\"brand\":\"\",\"serial\":\"\"},\"processor\":{\"brand\":\"\",\"serial\":\"\"},\"memory1\":{\"brand\":\"\",\"serial\":\"\"},\"memory2\":{\"brand\":\"\",\"serial\":\"\"},\"hdd\":{\"brand\":\"\",\"serial\":\"\"},\"ssd\":{\"brand\":\"\",\"serial\":\"\"},\"monitor\":{\"brand\":\"\",\"serial\":\"\"},\"gpu\":{\"brand\":\"\",\"serial\":\"\"},\"ups\":{\"brand\":\"\",\"serial\":\"\"}}', '{\"operatingSystem\":\"c\",\"productivitySuite\":\"c\",\"systemInstalled\":\"c\"}', '{\"ipAddress\":\"c\",\"macAddress\":\"c\",\"withInternet\":false,\"withoutInternet\":true,\"wireless\":false,\"wired\":false}');

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
(18724, 'Khent Rago', '$2y$10$Yk1SUk1RVzlVSmN1NVhZYOJXKj/XcvGIYJ65ylYNDl19L/1e80mdC', 3, 3, 'Administrative Aide VI', '[\"3.5\",\"5.1\",\"5.2\",\"5.3\",\"3.4\",\"5.4\",\"1.1\",\"1.2\",\"2.1\",\"2.2\",\"2.3\",\"2.4\",\"2.5\",\"2.6\",\"2.7\",\"2.8\",\"2.9\",\"3.1\",\"3.2\",\"3.3\",\"5.5\",\"4.3\",\"4.1\",\"4.2\",\"3.6\",\"5.6\"]', 1, 0);

--
-- Indexes for dumped tables
--

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
-- Indexes for table `preventive_maintenance`
--
ALTER TABLE `preventive_maintenance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pm_office` (`office_id`),
  ADD KEY `fk_pm_division` (`division_id`);

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
-- AUTO_INCREMENT for table `divisions`
--
ALTER TABLE `divisions`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `itrm_service_report`
--
ALTER TABLE `itrm_service_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;

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
-- AUTO_INCREMENT for table `preventive_maintenance`
--
ALTER TABLE `preventive_maintenance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
-- Constraints for table `personnels`
--
ALTER TABLE `personnels`
  ADD CONSTRAINT `fk_personnels_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`division_id`) ON UPDATE CASCADE;

--
-- Constraints for table `preventive_maintenance`
--
ALTER TABLE `preventive_maintenance`
  ADD CONSTRAINT `fk_pm_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`division_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pm_office` FOREIGN KEY (`office_id`) REFERENCES `office` (`office_id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
