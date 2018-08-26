SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `django` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `django` ;

-- -----------------------------------------------------
-- Table `django`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `django`.`User` (
  `idUser` INT NOT NULL,
  `Username` VARCHAR(45) NULL,
  `password` VARCHAR(45) NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE INDEX `Usercol_UNIQUE` (`Username` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `django`.`Session`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `django`.`Session` (
  `idSession` INT NOT NULL,
  `time` DATETIME NULL,
  `User_idUser` INT NOT NULL,
  PRIMARY KEY (`idSession`, `User_idUser`),
  INDEX `fk_Session_User1_idx` (`User_idUser` ASC),
  CONSTRAINT `fk_Session_User1`
    FOREIGN KEY (`User_idUser`)
    REFERENCES `django`.`User` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `django`.`Search`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `django`.`Search` (
  `idSearch` INT NOT NULL,
  `content` VARCHAR(100) NULL,
  `User_idUser` INT NOT NULL,
  `Session_idSession` INT NOT NULL,
  PRIMARY KEY (`idSearch`),
  INDEX `fk_Search_User1_idx` (`User_idUser` ASC),
  INDEX `fk_Search_Session1_idx` (`Session_idSession` ASC),
  CONSTRAINT `fk_Search_User1`
    FOREIGN KEY (`User_idUser`)
    REFERENCES `django`.`User` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Search_Session1`
    FOREIGN KEY (`Session_idSession`)
    REFERENCES `django`.`Session` (`idSession`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `django`.`Video`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `django`.`Video` (
  `idVideo` INT NOT NULL,
  `Rate` VARCHAR(45) NULL,
  `URL` VARCHAR(100) NULL,
  PRIMARY KEY (`idVideo`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `django`.`Rating`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `django`.`Rating` (
  `idRating` INT NOT NULL,
  `Ratingcol` VARCHAR(45) NULL,
  `Video_idVideo` INT NOT NULL,
  `User_idUser` INT NOT NULL,
  PRIMARY KEY (`idRating`),
  INDEX `fk_Rating_Video1_idx` (`Video_idVideo` ASC),
  INDEX `fk_Rating_User1_idx` (`User_idUser` ASC),
  CONSTRAINT `fk_Rating_Video1`
    FOREIGN KEY (`Video_idVideo`)
    REFERENCES `django`.`Video` (`idVideo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Rating_User1`
    FOREIGN KEY (`User_idUser`)
    REFERENCES `django`.`User` (`idUser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

