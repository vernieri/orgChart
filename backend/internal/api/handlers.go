package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/vernieri/orgChart/internal/db"
	"github.com/vernieri/orgChart/internal/models"
)

func RegisterRoutes(r *gin.Engine) {
	g := r.Group("/api/v1")
	g.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	// Teams
	g.POST("/teams", createTeam)
	g.GET("/teams", listTeams)

	// Employees CRUD básico
	g.POST("/employees", createEmployee)
	g.GET("/employees", listEmployees)
	g.GET("/employees/:id", getEmployee)
	g.PUT("/employees/:id", updateEmployee)
	g.DELETE("/employees/:id", deleteEmployee)

	// Árvore (MVP simples)
	g.GET("/employees/:id/tree", getTree)
}

func createTeam(c *gin.Context) {
	var t models.Team
	if err := c.ShouldBindJSON(&t); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	if err := db.DB.Create(&t).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	c.JSON(http.StatusCreated, t)
}

func listTeams(c *gin.Context) {
	var teams []models.Team
	if err := db.DB.Order("name").Find(&teams).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	c.JSON(http.StatusOK, teams)
}

func createEmployee(c *gin.Context) {
	var e models.Employee
	if err := c.ShouldBindJSON(&e); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	if err := db.DB.Create(&e).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	c.JSON(http.StatusCreated, e)
}

func listEmployees(c *gin.Context) {
	var list []models.Employee
	if err := db.DB.Preload("Team").Preload("Manager").Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
	}
	c.JSON(http.StatusOK, list)
}

func getEmployee(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var e models.Employee
	if err := db.DB.Preload("Team").Preload("Manager").First(&e, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return
	}
	c.JSON(http.StatusOK, e)
}

func updateEmployee(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body models.Employee
	if err := c.ShouldBindJSON(&body); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	body.ID = uint(id)
	if err := db.DB.Model(&models.Employee{}).Where("id = ?", id).Updates(body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
	}
	getEmployee(c)
}

func deleteEmployee(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := db.DB.Delete(&models.Employee{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
	}
	c.Status(http.StatusNoContent)
}

// MVP de árvore: carrega subordinados recursivamente
type Node struct {
	ID       uint    `json:"id"`
	Name     string  `json:"name"`
	Title    string  `json:"title"`
	Team     string  `json:"team,omitempty"`
	Children []Node  `json:"children,omitempty"`
}

func getTree(c *gin.Context) {
	rootID, _ := strconv.Atoi(c.Param("id"))
	var root models.Employee
	if err := db.DB.Preload("Team").First(&root, rootID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "root not found"}); return
	}
	node := buildNode(root)
	c.JSON(http.StatusOK, node)
}

func buildNode(e models.Employee) Node {
	var kids []models.Employee
	db.DB.Preload("Team").Where("manager_id = ?", e.ID).Find(&kids)

	n := Node{ID: e.ID, Name: e.Name, Title: e.Title}
	if e.Team != nil { n.Team = e.Team.Name }
	for _, k := range kids {
		n.Children = append(n.Children, buildNode(k))
	}
	return n
}
