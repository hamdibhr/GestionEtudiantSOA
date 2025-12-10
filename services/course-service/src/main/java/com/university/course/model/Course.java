package com.university.course.model;

import java.io.Serializable;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD) // <--- THIS IS THE FIX
public class Course implements Serializable {
    private String id;
    private String name;
    private String description;
    private double credits;

    public Course() {}

    public Course(String id, String name, String description, double credits) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.credits = credits;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getCredits() { return credits; }
    public void setCredits(double credits) { this.credits = credits; }
}