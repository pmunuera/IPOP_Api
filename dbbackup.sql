-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: containers-us-west-168.railway.app    Database: railway
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Cicles`
--

DROP TABLE IF EXISTS `Cicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` text,
  `id_familia_professional` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `id_familia_professional` (`id_familia_professional`),
  CONSTRAINT `Cicles_ibfk_1` FOREIGN KEY (`id_familia_professional`) REFERENCES `Families_Professionals` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cicles`
--

LOCK TABLES `Cicles` WRITE;
/*!40000 ALTER TABLE `Cicles` DISABLE KEYS */;
INSERT INTO `Cicles` VALUES (1,'Sistemes microinformatics i xarxes',1),(2,'Gestio administrativa',2),(3,'Electromecanica de vehicles automobils',3),(4,'Manteniment electromecanics',4),(5,'Mecanitzacio',5),(6,'ASIX - orientat a Ciberseguretat',1),(7,'Desenvolupament aplicacions multiplataforma',1),(8,'Desenvolupament aplicacions web',1),(9,'Administracio i finances',2),(10,'Assistencia a la direccio',2),(11,'Automocio',3),(12,'Mecatronica industrial',4),(13,'Programacio de la produccio en fabricacio mecanica',5),(14,'Gestio aigua',6);
/*!40000 ALTER TABLE `Cicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Connexions`
--

DROP TABLE IF EXISTS `Connexions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Connexions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nom` text,
  `cicle` text,
  `ip` text,
  `connexio` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Connexions`
--

LOCK TABLES `Connexions` WRITE;
/*!40000 ALTER TABLE `Connexions` DISABLE KEYS */;
/*!40000 ALTER TABLE `Connexions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Families_Professionals`
--

DROP TABLE IF EXISTS `Families_Professionals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Families_Professionals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Families_Professionals`
--

LOCK TABLES `Families_Professionals` WRITE;
/*!40000 ALTER TABLE `Families_Professionals` DISABLE KEYS */;
INSERT INTO `Families_Professionals` VALUES (1,'Informatica'),(2,'Administratiu'),(3,'Automocio'),(4,'Manteniment i serveis a la produccio'),(5,'Fabricacio mecanica'),(6,'Aigues');
/*!40000 ALTER TABLE `Families_Professionals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ocupacions`
--

DROP TABLE IF EXISTS `Ocupacions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ocupacions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` text,
  `id_cicle` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `id_cicle` (`id_cicle`),
  CONSTRAINT `Ocupacions_ibfk_1` FOREIGN KEY (`id_cicle`) REFERENCES `Cicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ocupacions`
--

LOCK TABLES `Ocupacions` WRITE;
/*!40000 ALTER TABLE `Ocupacions` DISABLE KEYS */;
INSERT INTO `Ocupacions` VALUES (1,'Personal tecnic instalador reparador equips informatics',1),(2,'Personal tecnic de suport informatic',1),(3,'Personal tecnic de xarxes de dades',1),(4,'Personal reparador de periferics de sistemes microinformatics',1),(5,'Comercials de microinformatica',1),(6,'Personal operador de teleassistencia',1),(7,'Personal operador de sistemes',1),(8,'Personal auxiliar administratiu',2),(9,'Personal ajudant oficina',2),(10,'Personal auxiliar administratiu de cobraments i pagaments',2),(11,'Personal administratiu comercial',2),(12,'Personal auxiliar administratiu de gestio de personal',2),(13,'Personal auxiliar administratiu de les administracions publiques',2),(14,'Recepcionista',2),(15,'Personal empleat atencio al client',2),(16,'Personal empleat de tresoreria',2),(17,'Personal empleat de mitjans de pagament',2),(18,'Electronicistes de vehicles',3),(19,'Electricistes electronics de manteniment i reparacio en automocio',3),(20,'Personal mecanic d’automobils',3),(21,'Electricistes automobils',3),(22,'Personal electromecanic automobils',3),(23,'Personal mecanic de motors i els seus sistemes auxiliars automobils i motocicletes',3),(24,'Personal reparador de sistemes pneumatics i hidraulics',3),(25,'Personal reparador de sistemes de transmissio i de frens',3),(26,'Personal reparador de sistemes de direccio i suspensio',3),(27,'Personal operari ITV',3),(28,'Personal instal·lador accessoris en vehicles',3),(29,'Personal operari empreses dedicades a la fabricacio de recanvis',3),(30,'Personal electromecanic de motocicletes',3),(31,'Personal venedor distribuidor de recanvis i equips de diagnosi',3),(32,'Mecanic de manteniment',4),(33,'Muntador industrial',4),(34,'Muntador equips electrics',4),(35,'Muntador equips electronics',4),(36,'Mantenidor de linia automatitzada',4),(37,'Muntador de bens equip',4),(38,'Muntador automatismes pneumatics i hidraulics',4),(39,'Instalador electricista industrial',4),(40,'Electricista de manteniment i reparacio equips de control, mesura i precisio',4),(41,'Personal ajustador operari de maquines eina',5),(42,'Personal polidor de metalls i afilador eines',5),(43,'Personal operador de maquines per treballar metalls',5),(44,'Personal operador de maquines eina',5),(45,'Personal operador de robots industrials',5),(46,'Personal treballador de la fabricacio eines, mecanic i ajustador, modelista matricer i similars',5),(47,'Personal torner, fresador i mandrinador',5),(48,'Personal tecnic en administracio de sistemes',6),(49,'Responsable informatica',6),(50,'Personal tecnic en serveis Internet',6),(51,'Personal tecnic en serveis de missatgeria electronica',6),(52,'Personal de recolzament i suport tecnic',6),(53,'Personal tecnic en teleassistencia',6),(54,'Personal tecnic en administracio de base de dades',6),(55,'Personal tecnic de xarxes',6),(56,'Personal supervisor de sistemes',6),(57,'Personal tecnic en serveis de comunicacions',6),(58,'Personal tecnic en entorns web',6),(59,'Desenvolupar aplicacions informatiques per a la gestio empresarial i de negoci',7),(60,'Desenvolupar aplicacions de proposit general',7),(61,'Desenvolupar aplicacions en ambit de entreteniment i la informatica mobil',7),(62,'Programador web',8),(63,'Programador multimedia',8),(64,'Desenvolupador aplicacions en entorns web',8),(65,'Administratiu oficina',9),(66,'Administratiu comercial',9),(67,'Administratiu financer',9),(68,'Administratiu comptable',9),(69,'Administratiu de logistica',9),(70,'Administratiu de banca i assegurances',9),(71,'Administratiu de recursos humans',9),(72,'Administratiu de Administracio publica',9),(73,'Administratiu assessories juridiques, comptables, laborals, fiscals o gestories',9),(74,'Tecnic en gestio de cobraments',9),(75,'Responsable atenció al client',9),(76,'Assistent a la direccio',10),(77,'Assistent personal',10),(78,'Secretari de direccio',10),(79,'Assistent de despatxos i oficines',10),(80,'Assistent juridic',10),(81,'Assistent en departaments de recursos humans',10),(82,'Administratiu en les administracions i organismes publics',10),(83,'Cap de area electromecanica',11),(84,'Recepcionista de vehicles',11),(85,'Cap de taller de vehicles de motor',11),(86,'Personal encarregat ITV',11),(87,'Personal perit taxador de vehicles',11),(88,'Cap de servei',11),(89,'Personal encarregat area de recanvis',11),(90,'Personal encarregat area comercial equips relacionats amb els vehicles',11),(91,'Cap de area de carrosseria xapa i pintura',11),(92,'Tecnic en planificacio i programacio de processos de manteniment instalacions de maquinaria i equip industrial',12),(93,'Cap equip de muntadors instalacions de maquinaria i equip industrial',12),(94,'Cap equip de mantenidors instalacions de maquinaria i equip industrial',12),(95,'Tecnic o tecnica en mecanica',13),(96,'Encarregat o encarregada instalacions de processament de metalls',13),(97,'Encarregat o encarregada operadors de maquines per treballar metalls',13),(98,'Encarregat o encarregada de muntadors',13),(99,'Programador o programadora de CNC',13),(100,'Programador o programadora de sistemes automatitzats en fabricacio mecanica',13),(101,'Programador o programadora de la produccio',13),(102,'Encarregat de muntatge de xarxes de proveiment i distribucio aigua',14),(103,'Encarregat de muntatge de xarxes i instalacions de sanejament',14),(104,'Encarregat de manteniment de xarxes aigua',14),(105,'Encarregat de manteniment de xarxes de sanejament',14),(106,'Operador de planta de tractament aigua de proveiment',14),(107,'Operador de planta de tractament aigues residuals',14),(108,'Tecnic en gestio de us eficient de aigua',14),(109,'Tecnic en sistemes de distribucio aigua',14);
/*!40000 ALTER TABLE `Ocupacions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ranking`
--

DROP TABLE IF EXISTS `Ranking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ranking` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `alies` text NOT NULL,
  `cicle` int DEFAULT NULL,
  `puntuacio` int DEFAULT NULL,
  `temps` time DEFAULT NULL,
  `encerts` int DEFAULT NULL,
  `errades` int DEFAULT NULL,
  `visible` tinyint(1) DEFAULT '1',
  `ip_jugador` text,
  `dispositiu` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `cicle` (`cicle`),
  CONSTRAINT `Ranking_ibfk_1` FOREIGN KEY (`cicle`) REFERENCES `Cicles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ranking`
--

LOCK TABLES `Ranking` WRITE;
/*!40000 ALTER TABLE `Ranking` DISABLE KEYS */;
INSERT INTO `Ranking` VALUES (1,'pablo',1,1000,'00:06:00',5,4,1,'198.10.20.13','Samsung'),(2,'pablo2',7,1200,'00:07:30',5,7,0,'198.11.20.12','Huawei'),(3,'Erik',3,2000,'00:05:00',5,2,1,'198.10.20.120','Iphone'),(4,'Borja',13,0,'00:40:00',4,90,1,'197.11.20.13','Samsung'),(5,'Rafa',5,2000,'00:02:00',5,0,1,'198.10.11.9','Xiaomi'),(6,'Enric',6,9000,'00:00:10',5,0,1,'188.121.20.13','Iphone');
/*!40000 ALTER TABLE `Ranking` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-06 19:54:05
