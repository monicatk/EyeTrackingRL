-- phpMyAdmin SQL Dump
-- version 4.6.3
-- https://www.phpmyadmin.net/
--
-- Host: mysqlhost.uni-koblenz.de
-- Generation Time: Jun 02, 2017 at 04:12 PM
-- Server version: 10.0.30-MariaDB
-- PHP Version: 7.0.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `django`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$30000$L8y3u6O4E4Jr$QupOlJXT14TTaqm9czSQdZ1Dt1w8EEbenKEyYw+vG+A=', '2017-05-29 23:15:26.590356', 1, 'admin', '', '', 'admin@uni-koblenz.de', 1, 1, '2017-02-01 02:24:40.247558'),
(2, 'pbkdf2_sha256$30000$4HM7aAE7lUNV$lRDXzncSn6n+HvYYO5kcKX537AD4dy5wp4SMWb5Dmps=', NULL, 0, 'Mariya', '', '', '', 0, 1, '2017-02-01 02:26:13.809910'),
(3, 'pbkdf2_sha256$30000$U9ZUQJCeyqeu$C5McHxavvIsRB1ZCisuxHXBtjxIW0+mcDNNE+R39nzo=', '2017-05-29 23:11:12.260558', 0, 'User', '', '', '', 0, 1, '2017-02-01 02:26:37.810282'),
(4, 'pbkdf2_sha256$30000$T3rtbA9upAj0$3AW6QmD2fsLTvzxsOyyapP4hRYOny+igXUh1zJ271Tg=', '2017-05-02 13:31:45.805307', 1, 'kemin', '', '', '', 1, 1, '2017-02-09 19:01:57.047129'),
(5, 'pbkdf2_sha256$30000$y8MvjQ7Av4s6$ZYt4lubn2KKgxzoLb3ovb12FKIni3QNCZRO/2Fv2G1w=', NULL, 0, 'User1', '', '', '', 0, 1, '2017-02-27 22:37:53.435881'),
(6, 'pbkdf2_sha256$30000$DBjqPBEjvv2t$SeqwPUXzPJL8ScG2IlffNDM+lQ8qEUjm1TC30kLg7Eg=', NULL, 0, 'User2', '', '', '', 0, 1, '2017-02-27 22:38:09.661423'),
(7, 'pbkdf2_sha256$30000$IoHtuCkDMiDM$xoyinkndknJ2CYPoVBzwxYwO5EAopxngu/dm7jr9rWM=', NULL, 0, 'User3', '', '', '', 0, 1, '2017-02-27 22:38:24.789948'),
(8, 'pbkdf2_sha256$30000$nxLy5ncZM49X$eMj+CUiWCzoXQ9fqKODt2oHagmku7lhmQHHq0FkM6NM=', NULL, 0, 'User4', '', '', '', 0, 1, '2017-02-27 22:38:44.550183'),
(9, 'pbkdf2_sha256$30000$gR7wMnoSKptE$1kR9NCV0yKmsuWKIOngjv5HoOMLLum1frZAwVGQ60CE=', NULL, 0, 'User5', '', '', '', 0, 1, '2017-02-27 22:38:59.328790'),
(10, 'pbkdf2_sha256$30000$Q1NQl3cuWFsT$Q+ub8d72gjjDOkZi/+FG0INOAcfiV89YJNw2DJP4U1M=', NULL, 0, 'User6', '', '', '', 0, 1, '2017-02-27 22:39:37.150994'),
(11, 'pbkdf2_sha256$30000$gRANZpaH8CMX$/sMzAVKL488Pwxjqb4EeBA6dQvt57a85H5ebHkRvVuE=', NULL, 0, 'User7', '', '', '', 0, 1, '2017-02-27 22:39:58.407114'),
(12, 'pbkdf2_sha256$30000$0K7hcWgFh80q$4QnTYKbFt6j2i/Pk1hwY7YlLN754wxBcxqQJV2plscQ=', NULL, 0, 'User8', '', '', '', 0, 1, '2017-02-27 22:40:12.090660'),
(13, 'pbkdf2_sha256$30000$4dxQYsxEmwyd$1Z3LVyqS9SiKzpL1k9/f6uasSaSTW9PzIBS7bWRCT4Q=', NULL, 0, 'User9', '', '', '', 0, 1, '2017-02-27 22:40:25.643762'),
(15, 'pbkdf2_sha256$30000$WCzvw9lkdtEt$JwOd2BsDQkxqv927RM9Ml5rh26Rb/GfZZkq+4xTbH4A=', '2017-05-30 15:51:33.971531', 0, 'Jannis', '', '', '', 1, 1, '2017-03-14 13:46:58.000000'),
(16, 'pbkdf2_sha256$30000$vuQxLX97wINr$A132AZw33P/728x+aN1EloJ2vIeoFazcS0F2KmFn+B8=', NULL, 1, 'Raphael', '', '', '', 1, 1, '2017-03-22 16:43:31.000000'),
(149, 'pbkdf2_sha256$30000$wK4lkb5Zjft2$WNpVV8mcnU4/Byurj3HQIpZwLyKLtUCNXez+yw5FEts=', '2017-06-01 11:50:31.229166', 1, 'admin-bci', '', '', '', 1, 1, '2017-05-01 06:14:13.000000'),
(151, 'pbkdf2_sha256$30000$UKiTA9ACOCff$2yTPUMSfCY4RTh7+MgOgNOpOu+qnR2KrenRwvOL0Pqg=', '2017-05-22 09:02:36.804703', 0, 'test1', '', '', '', 0, 1, '2017-05-19 08:07:26.711140'),
(152, 'pbkdf2_sha256$30000$kv05c93B0XDP$MBNkFi/R3t+BETbgc02rXNk3sltR9KxHei0qsQJRA9Y=', '2017-05-19 08:52:37.996216', 0, 'test2', '', '', '', 0, 1, '2017-05-19 08:08:11.423697'),
(153, 'pbkdf2_sha256$30000$CUArIxzG7hAq$JPy567Hh8NV9KD/sHNjD6bk4LgnDenq0Mq5IpvgrQIs=', '2017-05-22 15:06:53.122304', 0, 'test3', '', '', '', 0, 1, '2017-05-22 07:07:44.592813'),
(154, 'pbkdf2_sha256$30000$COkwjzeadCJq$WKAyppPhSNBbwSkaSWyxqSkSsulkqod/32IwsLAIxqc=', '2017-05-22 14:57:43.909891', 0, 'test4', '', '', '', 0, 1, '2017-05-22 07:07:58.140588'),
(155, 'pbkdf2_sha256$30000$6dylkIPJ9N2t$VFqeCIbIGRnaUNJ3Sm7hC/m0EEp8eJs2jaU5Siqo+iw=', '2017-05-22 13:19:06.083844', 0, 'test5', '', '', '', 0, 1, '2017-05-22 07:08:30.794456'),
(156, 'pbkdf2_sha256$30000$em1ZATmwDsLF$J+J4TMcuhLqN73YT6Gexvx9boGhVqQji/TZvRi1KOQY=', '2017-05-22 10:35:25.252200', 0, 'test6', '', '', '', 0, 1, '2017-05-22 07:08:46.336345'),
(157, 'pbkdf2_sha256$30000$3MOc2DLYUhA5$55Ugp6xYW4jVBuAELz1Qf4A1Mkw77WOGws46CNxrHiw=', '2017-05-22 12:49:57.521832', 0, 'test7', '', '', '', 0, 1, '2017-05-22 07:08:57.609989'),
(158, 'pbkdf2_sha256$30000$rG0QFSZnuC2N$6rfjJFCFyYC+/2v6/Fv41BB6PAKh9zX8E/XToe4+hOw=', '2017-05-22 11:32:41.550745', 0, 'test8', '', '', '', 0, 1, '2017-05-22 07:09:36.570218'),
(159, 'pbkdf2_sha256$30000$DCO3CiW6D3P6$1BiKsIjeIqmeYfed4yrnNyYNxeSxYSgx+4YtHRu1o24=', '2017-05-22 14:16:16.183035', 0, 'test9', '', '', '', 0, 1, '2017-05-22 07:09:53.063161'),
(160, 'pbkdf2_sha256$30000$jFPMjK7cCoJB$hM+7Mglc1GJSPgku0wQxobRJEQG/o/jEQ8TGnuTrgsk=', '2017-05-26 14:43:42.534985', 0, 'test10', '', '', '', 0, 1, '2017-05-22 07:10:10.053133'),
(161, 'pbkdf2_sha256$30000$sGscrJ7TgbEm$fU2M+YF70+Se42rQ7t0vrRgnE8x2xUWj1c0XPaTUDbc=', NULL, 0, 'test11', '', '', '', 0, 1, '2017-05-22 07:10:21.819806'),
(162, 'pbkdf2_sha256$30000$MDPNEVuLsboA$HW3mw2nTFsUwEMLNjSzMmByo5N7w4nSxkzYlcw6Vsz0=', '2017-05-23 10:09:58.442406', 0, 'test12', '', '', '', 0, 1, '2017-05-22 07:10:34.403526'),
(163, 'pbkdf2_sha256$30000$lzWNe4oqbhEc$Wv3nqe5NOj2Va6k82OoNJowNjIGqfVtpFHUhwRgZdes=', '2017-05-26 14:04:56.482942', 0, 'test13', '', '', '', 0, 1, '2017-05-22 07:10:47.371267'),
(164, 'pbkdf2_sha256$30000$tlwpQNsofGCa$HOGLV7tnLQ+lC0WO/IxxZVbCzg6K3LYD9k/4YmO8/oE=', '2017-05-24 12:32:58.543521', 0, 'test14', '', '', '', 0, 1, '2017-05-22 07:10:58.536906'),
(165, 'pbkdf2_sha256$30000$jdHQauweeOUs$o0N9/Ybq88E1pXw7IYJJgHasxTZ0DINZKjYjybG8hRI=', '2017-05-24 15:42:25.487673', 0, 'test15', '', '', '', 0, 1, '2017-05-22 07:11:11.538650'),
(166, 'pbkdf2_sha256$30000$gr4nwJrhhBDF$InrHqsTLD7gzfAPUGtPbD4b1ynNDMmWWpj+OzG4Ky5g=', '2017-05-26 14:01:55.962617', 0, 'test16', '', '', '', 0, 1, '2017-05-22 07:11:21.643228'),
(167, 'pbkdf2_sha256$30000$IHJmfzGxW9FH$Jx/yB2+Q6SJyFN86Y6JAdQE7Qh5/Q5dAY9hlB+9D2WQ=', '2017-05-24 17:22:02.867045', 0, 'test17', '', '', '', 0, 1, '2017-05-22 07:11:33.529907'),
(168, 'pbkdf2_sha256$30000$OdRxJ0ETGBor$SkaP72NG7p6BabRANWVnuvIBZhdgWJpyCh5ZmCUkMVE=', '2017-05-24 18:07:03.236497', 0, 'test18', '', '', '', 0, 1, '2017-05-22 07:11:44.616542'),
(169, 'pbkdf2_sha256$30000$ygRb5ijWhtrW$/zx0IUcYn/XRNNsLl3WhEQphDZNJOw6Vnb1T6TER/q4=', '2017-05-26 12:15:33.137540', 0, 'test19', '', '', '', 0, 1, '2017-05-22 07:11:54.663116'),
(170, 'pbkdf2_sha256$30000$LNjwuy0T6aA1$dESgcCy4Yu/ISpyHvDipB5LzO3IH3/aCgxhF6/xI8zg=', '2017-05-26 13:36:24.527024', 0, 'test20', '', '', '', 0, 1, '2017-05-22 07:12:06.027766');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=171;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
