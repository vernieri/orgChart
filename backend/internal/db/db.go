package db

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"github.com/vernieri/orgChart/internal/models"
)

var DB *gorm.DB

func Init() {
	database, err := gorm.Open(sqlite.Open("orgchart.db"), &gorm.Config{})
	if err != nil {
		log.Panicf("failed to open db: %v", err)
	}
	if err := database.AutoMigrate(&models.Team{}, &models.Employee{}); err != nil {
		log.Panicf("failed to migrate: %v", err)
	}
	DB = database
}
