package com.modernisticlms.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ModernisticLMSApplication {

	public static void main(String[] args) {
		SpringApplication.run(ModernisticLMSApplication.class, args);
	}

}
