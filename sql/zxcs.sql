/*
Navicat MySQL Data Transfer

Source Server         : bcos-finchain
Source Server Version : 50640
Source Host           : 10.6.250.53:3306
Source Database       : zxcs

Target Server Type    : MYSQL
Target Server Version : 50640
File Encoding         : 65001

Date: 2018-07-12 11:08:46
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for `tbl_novel`
-- ----------------------------
DROP TABLE IF EXISTS `tbl_novel`;
CREATE TABLE `tbl_novel` (
  `novel_hash` char(32) NOT NULL,
  `type` char(32) DEFAULT NULL,
  `size` int(10) DEFAULT NULL,
  `title` char(128) DEFAULT NULL,
  `detail` text,
  `xian_cao` int(10) DEFAULT NULL,
  `liang_cao` int(10) DEFAULT NULL,
  `gan_cao` int(10) DEFAULT NULL,
  `ku_cao` int(10) DEFAULT NULL,
  `du_cao` int(10) DEFAULT NULL,
  `time` int(10) DEFAULT NULL,
  PRIMARY KEY (`novel_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tbl_novel
-- ----------------------------
