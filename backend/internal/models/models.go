package models

type Team struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"uniqueIndex;size:120" json:"name"`
}

type Employee struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"size:120;not null" json:"name"`
	Email     string     `gorm:"uniqueIndex;size:180" json:"email"`
	Title     string     `gorm:"size:120" json:"title"`
	ManagerID *uint      `gorm:"index" json:"managerId"`
	Manager   *Employee  `gorm:"foreignKey:ManagerID" json:"manager,omitempty"`
	TeamID    *uint      `gorm:"index" json:"teamId"`
	Team      *Team      `json:"team,omitempty"`
}
