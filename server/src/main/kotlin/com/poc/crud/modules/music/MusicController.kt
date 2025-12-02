package com.poc.crud.modules.music

import com.poc.crud.modules.music.dto.MusicCipherResponseDTO
import com.poc.crud.modules.music.dto.MusicDTO
import com.poc.crud.modules.music.dto.PostMusicDTORequest
import com.poc.crud.modules.music.dto.PostMusicDTOResponse
import com.poc.crud.modules.music.service.MusicService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v1/musics")
class MusicController(
    private val musicService: MusicService
) {

    @GetMapping("")
    fun getAll(@RequestParam(required = false) groupId: Long?): ResponseEntity<Set<MusicDTO>> =
        ResponseEntity(musicService.getAllMusic(groupId), HttpStatus.OK)

    @GetMapping("/{id}/url")
    fun getMusicUrl(@PathVariable id: Long): ResponseEntity<String> = ResponseEntity.ok(musicService.getMusicUrl(id))

    @GetMapping("/{id}/cipher")
    fun getMusicCipherData(@PathVariable id: Long): ResponseEntity<MusicCipherResponseDTO> {
        // Placeholder implementation for cipher retrieval
        val cipherData = musicService.getMusicCipherData(id)
        return ResponseEntity.ok(cipherData)
    }

    @PutMapping("/{id}/cipher")
    fun postMusicCipher(@PathVariable id: Long, @RequestBody cipher: String): ResponseEntity<String> {
        musicService.updateMusicCipherFile(id, cipher)
        return ResponseEntity.ok("Cipher for music ID $id has been stored.")
    }

    @PostMapping("", consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun post(
        @RequestBody music: PostMusicDTORequest,
    ): PostMusicDTOResponse? = musicService.insertMusic(
        music
    )

    @PostMapping("/confirm/{id}")
    fun confirmMusic(@PathVariable id: Long): ResponseEntity<String> {
        musicService.confirmMusicUpload(id)
        return ResponseEntity.ok("Music upload confirmed.")
    }
}