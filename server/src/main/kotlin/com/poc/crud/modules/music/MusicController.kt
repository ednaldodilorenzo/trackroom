package com.poc.crud.modules.music

import com.poc.crud.core.pagination.toResponse
import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.PatchMusicReqDTO
import com.poc.crud.modules.music.service.MusicService
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/musics")
class MusicController(
    private val musicService: MusicService
) {

    @GetMapping("")
    fun getAll(@RequestParam(required = false) groupId: Long?, pageable: Pageable) =
        musicService.getAllMusic(groupId!!, pageable).toResponse()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long) = this.musicService.getById(id)

    @GetMapping("/{id}/url")
    fun getMusicUrl(@PathVariable id: Long) = musicService.getMusicUrl(id)

    @GetMapping("/{id}/cipher")
    fun getMusicCipherData(@PathVariable id: Long): MusicCipherResponseDTO {
        // Placeholder implementation for cipher retrieval
        val cipherData = musicService.getMusicCipherData(id)
        return cipherData
    }

    @PutMapping("/{id}/cipher", consumes = [MediaType.TEXT_PLAIN_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun postMusicCipher(@PathVariable id: Long, @RequestBody cipher: String): String {
        musicService.updateMusicCipherFile(id, cipher)
        return "Cipher for music ID $id has been stored."
    }

    @PatchMapping("/{id}")
    fun updateMusic(
        @PathVariable id: Long, @RequestBody music: PatchMusicReqDTO
    ) = this.musicService.updateMusic(id, music)


    @PostMapping("/confirm/{id}")
    fun confirmMusic(@PathVariable id: Long): String {
        musicService.confirmMusicUpload(id)
        return "Music upload confirmed."
    }
}