package com.tcc.caa.prancha;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PranchaRepository extends JpaRepository<Prancha, Long> {

    List<Prancha> findAllByOrderByIdDesc();
}