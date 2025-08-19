package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/vernieri/orgChart/internal/api"
	"github.com/vernieri/orgChart/internal/db"
)

func main() {
	db.Init()

	r := gin.Default()
	api.RegisterRoutes(r)

	log.Println("listening on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
